const express = require("express");
const userAuth = require("../middlewares/auth");
const router = express.Router();
const db = require("../models");
const sendMail = require("../middlewares/mailer");

router.post("/new", userAuth, async (req, res) => {
  const person = req.person;
  const volunteer = await person.getVolunteer();

  if (!volunteer) {
    res.status(403).json({
      error: "Para crear una actividad debes ser un voluntario",
    });
    return null;
  } else {
    const match = await db.Match.findByPk(req.body.matchId);
    if (!match)
    {
      res.status(404).json({
        error: "Id de Match no encontrado",
      });
      return null;
    }
    let matchVolunteer = await match.getVolunteer();
    if (matchVolunteer.get().id != volunteer.get().id)
    {
      res.status(403).json({
        error: "El id Match especificado no está asociado al usuario",
      });
      return null;
    }
    let userPerson = await match.getUser()
    userPerson = await userPerson.getPerson();
    const activity = await match.createActivity({
      description: req.body.description,
      accompanimentType: req.body.accompanimentType,
      date: req.body.date
    });
    let today = new Date();
    today.setHours(0,0,0,0);
    let activityDate = activity.get().date;
    if (activityDate < new Date())
    {
      let yesterday = new Date();
      yesterday.setHours(0,0,0,0);
      yesterday.setDate(today.getDate() - 1);

      if (yesterday < activityDate)
      {
        sendMail(person.get().email, "Recordatorio Actividad RAFA", 
          `Hola, te recordamos que mañana a las ${activityDate.getHours()}:${activityDate.getMinutes()} 
          tienes una actividad con ${userPerson.get().firstName} ${userPerson.get().lastName}`
        );
        sendMail(userPerson.get().email, "Recordatorio Actividad RAFA", 
          `Hola, te recordamos que mañana a las ${activityDate.getHours()}:${activityDate.getMinutes()} 
          tienes una actividad con ${person.get().firstName} ${person.get().lastName}`
        );

      }
      // ENVIAR MAIL DE EVALUACIÓN USUARIO
      activityDate.setDate(activityDate.getDate()+1);
      setTimeout(sendMail(userPerson.get().email, "Evaluación Actividad RAFA", 
          `Hola, por favor evalua la actividad que realizaste con 
          ${person.get().firstName} ${person.get().lastName} en este link:

          https://app-rafa.vercel.app/activities/eval-activity/${activity.get().id}
          `
        ), activityDate - Date.now());

      // ENVIAR MAIL RECORDANDO UN DÍA ANTES
      activityDate.setDate(activityDate.getDate()-2);
      setTimeout(sendMail(person.get().email, "Recordatorio Actividad RAFA", 
          `Hola, te recordamos que mañana a las ${activityDate.getHours()}:${activityDate.getMinutes()} 
          tienes una actividad con ${userPerson.get().firstName} ${userPerson.get().lastName}`
        ), activityDate - Date.now());

      setTimeout(sendMail(userPerson.get().email, "Recordatorio Actividad RAFA", 
          `Hola, te recordamos que mañana a las ${activityDate.getHours()}:${activityDate.getMinutes()} 
          tienes una actividad con ${person.get().firstName} ${person.get().lastName}`
        ), activityDate - Date.now());
    } else {
      // ENVIAR MAIL DE EVALUACIÓN USUARIO
      sendMail(userPerson.get().email, "Evaluación Actividad RAFA", 
        `Hola, por favor evalua la actividad que realizaste con 
        ${person.get().firstName} ${person.get().lastName} en este link:
        https://app-rafa.vercel.app/activities/eval-activity/${activity.get().id}
        `
      );
    }
    res.json({error: null})
  }
});


router.post("/addReport", userAuth, async (req, res) => {
  const person = req.person;
  const volunteer = await person.getVolunteer();

  if (!volunteer) {
    res.status(403).json({
      error: "Para crear un reporte debes ser un voluntario.",
    });
    return null;
  } else {
    const activity = await db.Activity.findByPk(req.body.activityId);
    if (!activity)
    {
      res.status(404).json({
        error: "Id de Activity incorrecto",
      });
      return null;
    }
    activity.mood = req.body.mood;
    activity.report = req.body.report;
    await activity.save();
  }
  return res.status(200).json({error: null});
});

router.post("/evaluate", userAuth, async (req, res) => {
  const person = req.person;
  const user = await person.getUser();

  if (!user) {
    res.status(401).json({
      error: "Para evaluar una actividad debes ser un usuario.",
    });
  } else {
    const activity = await db.Activity.findByPk(req.body.activityId);
    if (!activity)
    {
      res.status(404).json({
        error: "Actividad no encontrada",
      });
    }
    let matchUser = await activity.getMatch();
    matchUser = await matchUser.getUser(); 
    if (matchUser.get().id != user.get().id)
    {
      res.status(403).json({
        error: "El id Match especificado no está asociado al usuario",
      });
    }
    activity.userComment = req.body.userComment;
    activity.userRating = req.body.userRating;
    await activity.save();

    let volunteer = await activity.getMatch();
    volunteer = await volunteer.getVolunteer();
    let coords = await volunteer.getGcoordinators();
    volunteer = await volunteer.getPerson();

    // ENVIAR CORREO A CADA COORDINADOR
    for (var i = 0; i < coords.length; i++) {
      let coord = coords[i];
      coord = await coord.getVolunteer();
      coord = await coord.getPerson();
      
      sendMail(coord.get().email, "Evaluación completada RAFA", 
        `Hola, acaban de evaluar la actividad de ${volunteer.get().firstName} ${volunteer.get().lastName}.
        `
      );
    }
    res.json({error: null});
  }
});

router.post("/activities", userAuth, async (req, res) => {

  const match = await db.Match.findByPk(req.body.matchId);
  const activities = await match.getActivities({
    order: ['date'],
    attributes: ['id','description', 'accompanimentType', 'userComment', 'date', 'userRating', 'mood', 'report']
  });
  console.log(activities);

  // jsonResponse = {
  //   activities: [],
  // };
  // for (var i = 0; i < activities.length; i++) {
  //   let activity = activities[i];
  //   jsonResponse.activities.push({
  //     description: activity.get().description,
  //     accompanimentType: activity.get().accompanimentType,
  //     userComment: activity.get().userComment,
  //     date: activity.get().date,
  //     userRating: activity.get().userRating
  //   })
  // }
  res.json(activities);
});


router.get("/:id", userAuth, async (req, res) => {
  const activity = await db.Activity.findByPk(req.params.id);
  if (!activity)
  {
    res.status(404).json({
      error: "Actividad no encontrada",
    });
  }
  res.json({
    description: activity.get().description,
    accompanimentType: activity.get().accompanimentType,
    userComment: activity.get().userComment,
    date: activity.get().date,
    userRating: activity.get().userRating,
    mood: activity.get().mood,
    report: activity.get().report
  });
});


module.exports = router;