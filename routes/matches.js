const express = require("express");
const userAuth = require("../middlewares/auth");
const router = express.Router();
const db = require("../models");
const sendMail = require("../middlewares/mailer");
const { Op } = require("sequelize");

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}


async function findVolunteer(volunteers, userSchedule, personalInterests){

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let candidates = [];
  let min_matches = volunteers[0].get().matches;
  for (let i = 0; i < volunteers.length; i++) {

    let volunteer = volunteers[i];
    if (volunteer.get().matches > min_matches)
    {
      if (candidates.length > 0)
      {
        let best_candidate = [];
        let best_pi = -1;
        for (let i = 0; i < candidates.length; i++) {
          let candidate = candidates[i];
          let pi = await candidate.countPersonalInterests({where: {id: personalInterests}});
          if (pi > best_pi)
          {
            best_pi = pi;
            best_candidate = candidate;
          }
        }
        return best_candidate;
      }

      candidates = [];
      min_matches = volunteer.get().matches; 
    }

    for (let i = 0; i < days.length; i++) {
      let day = days[i];
      if (userSchedule[day][0] || userSchedule[day][1]) {
        if (userSchedule[day][0]) {  
          let schedule = await eval("volunteer.get"+day+"s()");
          console.log(schedule);
          for (let i = 0; i < schedule.length; i++) {
            let hours = schedule[i];
            if (hours.get().endTime < "13:00") {
              candidates.push(volunteer);
            }
          }
        }
        if (userSchedule[day][1]) {
          let schedule = await eval("volunteer.get"+day+"s()");
          for (let i = 0; i < schedule.length; i++) {
            let hours = schedule[i];
            if (hours.get().endTime < "21:00" && hours.get().startTime > "13:00") {
              candidates.push(volunteer);
            }
          }
        }
      }
    }
    if(candidates.length > 0 && i == volunteers.length-1)
    {
      console.log(candidates);
      let best_candidate = [];
      let best_pi = -1;
      for (let i = 0; i < candidates.length; i++) {
        let candidate = candidates[i];
        let pi = await candidate.countPersonalInterests({where: {id: personalInterests}});
        if (pi > best_pi)
        {
          best_pi = pi;
          best_candidate = candidate;
        }
      }
      return best_candidate;
    }
  }
  return null;
}

router.post("/new", userAuth, async (req, res) => {
  console.log(req.body);
  let person = req.person;
  const userSchedule = req.body.schedule;

  const user = await person.getUser();
  const patient = await user.getPatient();
  if (!patient) {
    res.status(403).json({
      error: "Para solicitar un match debes ser paciente.",
    });
  } else if (await user.countMatches({where: {date: {[Op.ne]: null}}}) > 0) {
    res.status(409).json({
      error: "Usuario ya tiene un match.",
    });
  }
  else {
    try {
      const volunteersCandidates = await db.Volunteer.findAll({
        order: ['matches']
      });
      let volunteers = [];
      for (var i = 0; i < volunteersCandidates.length; i++) {
        let volunteer = volunteersCandidates[i];
        let person = await volunteer.getPerson();
        if (person.get('status') == 3)
        {
          volunteers.push(volunteer);
        }
      }

      let personalInterests = await user.getPersonalInterests({attributes: ['id']})
        .then(ids => ids.map(id => id.id));

      let selected = await findVolunteer(volunteers, userSchedule, personalInterests);
      if (!selected)
      {
        res.status(409).json({error: "No hay voluntarios disponibles."})
        return null;
      }

      const match = await user.createMatch({
        description: req.body.description,
      });

      await match.setVolunteer(selected);
      match.date = new Date();
      await match.save();
      selected.matches += 1;
      await selected.save();

      let commonInterests = await selected.getPersonalInterests({where: {id: personalInterests}})
        .then(interests => interests.map(interests => interests.name));

      const selectedPerson = await selected.getPerson();


      // ENVIAR CORREO A VOLUNTARIO Y USER
      sendMail(selectedPerson.get().email, "Hay un nuevo paciente que necesita de tu ayuda!", 
          `Hola, acabamos de asignarte como paciente a ${person.get().firstName} ${person.get().lastName},
          te dejamos su correo para que lo contactes y organicen su primera actividad!
          ${person.get().email}. 
          Recuerda crear la actividad en el sitio web tan pronto como se organicen`
        );
      sendMail(person.get().email, "Felicitaciones, encontramos a tu voluntario", 
          `Hola, un voluntario de RAFA te contactará prontamente por correo.
          Mantente atento!`
        );

      res.json({
        match: {
          id: match.get().id,
          description: match.get().description,
        },
        volunteer: {
          id: selectedPerson.get().id,
          firstName: selectedPerson.get().firstName,
          lastName: selectedPerson.get().lastName,
          email: selectedPerson.get().email,
          gender: selectedPerson.get().gender,
          senior: selected.get().senior,
          adult: selected.get().adult,
          adolescence: selected.get().adolescence,
          children: selected.get().children,
          accompaniment: selected.get().accompaniment,
          commonInterests,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  }
});

router.get("/matches", userAuth, async (req, res) => {
  let person = req.person;
  const role = req.personRole;
  if (role == "Volunteer" || role == "Coordinator") {
    let volunteer = await person.getVolunteer();
    let matches = await volunteer.getMatches();
    jsonResponse = {
      matches: [],
    };
    let activities = [];
    for (let i = 0; i < matches.length; i++) {
      let match = matches[i];
      activities.push(await match.getActivities());
      let user = await match.getUser();

      let personalInterests = await volunteer.getPersonalInterests({attributes: ['id']})
        .then(ids => ids.map(id => id.id));
      let commonInterests = await user.getPersonalInterests({where: {id: personalInterests}})
        .then(interests => interests.map(interests => interests.name));


      let userPerson = await user.getPerson();
      let caregiver = await user.getPatient();
      let count = await caregiver.countCaregivers();
      if (count > 0)
      {
        caregiver = await caregiver.getCaregivers(); 
        caregiver = caregiver[0];
        caregiver = await caregiver.getUser();
        caregiver = await caregiver.getPerson();

        jsonResponse.matches.push({
          match: {
            id: match.get().id,
            description: match.get().description,
          },
          user: {
            id: userPerson.get().id,
            firstName: userPerson.get().firstName,
            lastName: userPerson.get().lastName,
            email: userPerson.get().email,
            gender: userPerson.get().gender,
            commonInterests,
            comuna: userPerson.get().comuna, 
            age: getAge(userPerson.get().birthDate)
          },
          caregiver: {
            email: caregiver.get().email,
            firstName: caregiver.get().firstName,
            lastName: caregiver.get().lastName
          }
        });
      } else {
        jsonResponse.matches.push({
          match: {
            id: match.get().id,
            description: match.get().description,
          },
          user: {
            id: userPerson.get().id,
            firstName: userPerson.get().firstName,
            lastName: userPerson.get().lastName,
            email: userPerson.get().email,
            gender: userPerson.get().gender,
            commonInterests,
            comuna: userPerson.get().comuna, 
            age: getAge(userPerson.get().birthDate)
          },
          caregiver: {
            email: '-----',
            firstName: '-----',
            lastName: '-----'
          }
        });        
      }
    }
    if (role == "Volunteer")
    {
      res.json(jsonResponse);
      return ;
    }

    let avgRating = 0;
    let countActivities = 0
    
    for (var i = 0; i < activities.length; i++) {
      for(var j = 0; j < activities[i].length; j++){
        let activity = activities[i][j];
        avgRating += activity.get().userRating;
        countActivities ++;
      }
    }
    coordResponse = {
      matches: [{volunteerName: `${person.get().firstName} ${person.get().lastName}`,
        volunteerId: volunteer.get().id,
        avgRating: avgRating/countActivities || '--',
        matches: jsonResponse.matches}]
    }

    let volunteers = await volunteer.getCoordinator();
    volunteers = await volunteers.getVolunteerees();

    for (var i = 0; i < volunteers.length; i++) {
      let volunteer = volunteers[i];
      let person = await volunteer.getPerson();

      let matches = await volunteer.getMatches();
      let m = [];
      let activities = [];
      for (let j = 0; j < matches.length; j++) {
        let match = matches[j];
        activities.push(await match.getActivities());
        let user = await match.getUser();

        let personalInterests = await volunteer.getPersonalInterests({attributes: ['id']})
          .then(ids => ids.map(id => id.id));
        let commonInterests = await user.getPersonalInterests({where: {id: personalInterests}})
          .then(interests => interests.map(interests => interests.name));

        let userPerson = await user.getPerson();
        let caregiver = await user.getPatient();
        let count = await caregiver.countCaregivers();
        if (count > 0)
        {
          caregiver = await caregiver.getCaregivers(); 
          caregiver = caregiver[0];
          caregiver = await caregiver.getUser();
          caregiver = await caregiver.getPerson();

          m.push({
            match: {
              id: match.get().id,
              description: match.get().description,
            },
            user: {
              id: userPerson.get().id,
              firstName: userPerson.get().firstName,
              lastName: userPerson.get().lastName,
              email: userPerson.get().email,
              gender: userPerson.get().gender,
              commonInterests,
              comuna: userPerson.get().comuna, 
              age: getAge(userPerson.get().birthDate)
            },
            caregiver: {
              email: caregiver.get().email,
              firstName: caregiver.get().firstName,
              lastName: caregiver.get().lastName
            }
          });
        } else {
          m.push({
            match: {
              id: match.get().id,
              description: match.get().description,
            },
            user: {
              id: userPerson.get().id,
              firstName: userPerson.get().firstName,
              lastName: userPerson.get().lastName,
              email: userPerson.get().email,
              gender: userPerson.get().gender,
              commonInterests,
              comuna: userPerson.get().comuna, 
              age: getAge(userPerson.get().birthDate)
            },
            caregiver: {
              email: '-----',
              firstName: '-----',
              lastName: '-----'
            }
          });        
        }
      }
      console.log(m);
      let avgRating = 0;
      let countActivities = 0
      
      for (var k = 0; k < activities.length; k++) {
        for(var l = 0; l< activities[k].length; l++){
          let activity = activities[k][l];
          avgRating += activity.get().userRating;
          countActivities ++;
        }
      }

      coordResponse.matches.push({volunteerName: `${person.get().firstName} ${person.get().lastName}`,
        volunteerId: volunteer.get().id,
        avgRating: avgRating/countActivities || '--',
        matches: m
      })
    }
    res.json(coordResponse);
    return ;
  } else {
    let patient;
    if (role == "Caregiver")
    {
      let caregiver = await person.getUser();
      caregiver = await caregiver.getCaregiver();
      let count = await caregiver.countPatients();
      if (!count)
      {
        res.status(409).json({error: 'No tienes ningún paciente asociado.'})
        return ;
      }
      let patients = await caregiver.getPatients();
      patient = patients[0];
    } else {
      let user = await person.getUser();
      patient = await user.getPatient();
    }
    const user = await patient.getUser();
    let userPerson = await user.getPerson();
    const matches = await user.getMatches({where: {date: {[Op.ne]: null}}});

    jsonResponse = {
      patient: `${userPerson.firstName} ${userPerson.lastName}`,
      matches: [],
    };
    for (let i = 0; i < matches.length; i++) {
      let match = matches[i];
      let volunteer = await match.getVolunteer();
      if (volunteer) {

        const volunteerPerson = await volunteer.getPerson();
        let personalInterests = await volunteer.getPersonalInterests({attributes: ['id']})
          .then(ids => ids.map(id => id.id));
        let commonInterests = await user.getPersonalInterests({where: {id: personalInterests}})
          .then(interests => interests.map(interests => interests.name));

        jsonResponse.matches.push({
          match: {
            id: match.get().id,
            description: match.get().description,
          },
          volunteer: {
            id: volunteerPerson.get().id,
            firstName: volunteerPerson.get().firstName,
            lastName: volunteerPerson.get().lastName,
            email: volunteerPerson.get().email,
            gender: volunteerPerson.get().gender,
            senior: volunteer.get().senior,
            adult: volunteer.get().adult,
            adolescence: volunteer.get().adolescence,
            children: volunteer.get().children,
            accompaniment: volunteer.get().accompaniment,
            commonInterests
          },
        });
      } else {
        jsonResponse.matches.push({
          match: {
            id: match.get().id,
            description: match.get().description,
          },
          volunteer: null,
        });
      }
    }
    res.json(jsonResponse);
  }
});

module.exports = router;