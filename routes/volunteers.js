const express = require("express");
const userAuth = require("../middlewares/auth");
const router = express.Router();
const {registerPerson, verificadorRut} = require("../middlewares/globalRegister");
const updatePerson = require("../middlewares/personUpdate")
const findRole = require("../middlewares/findRole")
const db = require("./../models");
const activateAccount = require("../middlewares/activation");
const requestNotification = require("../middlewares/requestNotification")


router.post("/register", registerPerson, async (req, res) => {
  try {
    req.person.role = "volunteers"
    if (!verificadorRut.validaRut(req.body.rutCoordinator.toString())) {
      return res.status(400).json({ error: "Rut de coordinador inválido" });
    }
    const coordPerson = await db.Person.findOne({ where: { rut: req.body.rutCoordinator } })
    if (await findRole(coordPerson) != 'Coordinator') return res.status(404).json({ error: "Coordinador no existe" });
    let coord = await coordPerson.getVolunteer()
    coord = await coord.getCoordinator()
    await req.person.save()
    const volunteer = await req.person.createVolunteer({
      senior: req.body.senior,
      adult: req.body.adult,
      adolescence: req.body.adolescence,
      children: req.body.children,
      accompaniment: req.body.accompaniment,
      matches: 0
    });
    await volunteer.setGcoordinators([coord])
    activateAccount(req.person)
    requestNotification(req.person, coordPerson.get().email, 'volunteer-requests')
    res.json({
      error: null
    });
  } catch (error) {
    await req.person.destroy()
    console.log(error)
    res.status(500).json({ error: "Hubo un error" });
  }
});

router.get("/:id", userAuth, async (req, res) => {
  try {
    if (req.params.id != req.person.get().id) {
      res.status(403).json({error: "Id no coincide con el de usuario"})
      return
    }
    const volunteer = await req.person.getVolunteer()
    let activities = [];
    let matches = await volunteer.getMatches();
    for (var i = 0; i < matches.length; i++) {
      let match = matches[i];
      activities.push(await match.getActivities());
    }
    let avgRating = 0;
    let count = 0
    
    for (var i = 0; i < activities.length; i++) {
      for(var j = 0; j < activities[i].length; j++){
        let activity = activities[i][j];
        avgRating += activity.get().userRating;
        count ++;
      }
    }

    let schedule = {
      monday: await volunteer.getMondays(),
      tuesday: await volunteer.getTuesdays(),
      wednesday: await volunteer.getWednesdays(),
      thursday: await volunteer.getThursdays(),
      friday: await volunteer.getFridays(),
      saturday: await volunteer.getSaturdays(),
      sunday: await volunteer.getSundays()
    }
    avgRating = avgRating / count;

    const pInterests = (await volunteer.getPersonalInterests({
      attributes: ['id', 'name']
    })).map(pInt => ({id: pInt.id, name: pInt.name}))
    res.status(200).json({
      rut: req.person.rut,
      firstName: req.person.firstName,
      lastName: req.person.lastName,
      email: req.person.email,
      birthDate: req.person.birthDate,
      comuna: req.person.comuna,
      country: req.person.comuna,
      civilState: req.person.civilState,
      status: req.person.status,
      address: req.person.address,
      gender: req.person.gender,
      banned: req.person.banned,
      pictureUrl: req.person.pictureUrl,
      senior: volunteer.senior,
      adult: volunteer.adult,
      adolescence: volunteer.adolescence,
      children: volunteer.children,
      accompaniment: volunteer.accompaniment,
      role: req.personRole,
      avgRating: avgRating,
      nActivities: activities.length,
      pInterests,
      schedule
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})

router.post("/addSchedule", userAuth, async (req, res) => {
  // EXAMPLE
  // {"schedule":  {
  //   "monday":
  //       [{
  //       "startTime": "8:00",
  //       "endTime": "10:00",
  //       "note": "a veces me quedo dormido"
  //       },
  //       { "startTime": "16:00",
  //       "endTime": "20:00",
  //       "note": "a veces estudio"
  //       }],
  //   "tuesday": [],
  //   "wednesday": [{
  //       "startTime": "8:00",
  //       "endTime": "10:00",
  //       "note": "a veces me quedo dormido"
  //       }],
  //   "thursday": [],
  //   "friday": [],
  //   "saturday": [],
  //   "sunday": []
  //   }
  // }
  if (req.personRole == "Volunteer" || req.personRole == "Coordinator") {
    try {
      const person = req.person;
      const volunteer = await person.getVolunteer();

      const monday = req.body.schedule.monday;
      for (let i = 0; i < monday.length; i++) {
        let schedule = monday[i];
        await volunteer.createMonday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const tuesday = req.body.schedule.tuesday;
      for (let i = 0; i < tuesday.length; i++) {
        let schedule = tuesday[i];
        await volunteer.createTuesday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const wednesday = req.body.schedule.wednesday;
      for (let i = 0; i < wednesday.length; i++) {
        let schedule = wednesday[i];
        await volunteer.createWednesday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const thursday = req.body.schedule.thursday;
      for (let i = 0; i < thursday.length; i++) {
        let schedule = thursday[i];
        await volunteer.createThursday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const friday = req.body.schedule.friday;
      for (let i = 0; i < friday.length; i++) {
        let schedule = friday[i];
        await volunteer.createFriday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const saturday = req.body.schedule.saturday;
      for (let i = 0; i < saturday.length; i++) {
        let schedule = saturday[i];
        await volunteer.createSaturday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const sunday = req.body.schedule.sunday;
      for (let i = 0; i < sunday.length; i++) {
        let schedule = sunday[i];
        await volunteer.createSunday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }
      res.json({ error: null });
    } catch (err) {
      res.status(500).json({error: "Hubo un error."});
    }
  } else {
    res.status(403).json({ error: "Usuario no es voluntario." });
  }
});

router.patch("/editSchedule", userAuth, async (req, res) => {
  if (req.personRole == "Volunteer" || req.personRole == "Coordinator") {
    try {
      const person = req.person;
      const volunteer = await person.getVolunteer();

      const monday = req.body.schedule.monday;
      for (let i = 0; i < monday.length; i++) {
        let schedule = monday[i];
        await volunteer.createMonday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const tuesday = req.body.schedule.tuesday;
      for (let i = 0; i < tuesday.length; i++) {
        let schedule = tuesday[i];
        await volunteer.createTuesday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const wednesday = req.body.schedule.wednesday;
      for (let i = 0; i < wednesday.length; i++) {
        let schedule = wednesday[i];
        await volunteer.createWednesday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const thursday = req.body.schedule.thursday;
      for (let i = 0; i < thursday.length; i++) {
        let schedule = thursday[i];
        await volunteer.createThursday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const friday = req.body.schedule.friday;
      for (let i = 0; i < friday.length; i++) {
        let schedule = friday[i];
        await volunteer.createFriday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const saturday = req.body.schedule.saturday;
      for (let i = 0; i < saturday.length; i++) {
        let schedule = saturday[i];
        await volunteer.createSaturday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }

      const sunday = req.body.schedule.sunday;
      for (let i = 0; i < sunday.length; i++) {
        let schedule = sunday[i];
        await volunteer.createSunday({
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          note: schedule.note,
        });
      }
      res.json({ error: null });
    } catch (err) {
      res.status(500).json({error: "Hubo un error."});
    }
  } else {
    res.status(403).json({ error: "Usuario no es voluntario." });
  }
});

router.patch("/:id", userAuth, updatePerson, async (req, res) => {
  try {
    const volunteer = await req.person.getVolunteer()

    volunteer.senior = req.body.senior ?? volunteer.senior
    volunteer.adult = req.body.adult ?? volunteer.adult
    volunteer.adolescence = req.body.adolescence ?? volunteer.adolescence
    volunteer.children = req.body.children ?? volunteer.children
    volunteer.accompaniment = req.body.accompaniment ?? volunteer.accompaniment
    volunteer.status = 3
    await volunteer.save()
    res.status(200).json({
      error: null
    })
  } catch (error) {
    res.status(500).json({ error });
  }
})

module.exports = router;
