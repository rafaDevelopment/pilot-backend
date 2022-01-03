const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/auth");
const promotionNotification = require("../middlewares/promotionNotification")
const banNotification = require("../middlewares/banNotification")

router.get("/:id/solicitudes", userAuth, async (req, res) => {
  try {
    if (req.personRole != "Coordinator") return res.status(403).json({ error: "Debes ser coordinador" });
    
    var volCoord = await req.person.getVolunteer()
    volCoord = await volCoord.getCoordinator()
    if (!volCoord) return res.status(404).json({ error: "Usuario no encontrado" });
    var volRequests = []
    const volunteers = await volCoord.getVolunteerees()
    for (let i = 0; i < volunteers.length; i++) {
      let vol = volunteers[i]
      let person = await vol.getPerson({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'rut',
          'role',
          'status'
        ]
      })
      if (person.status == 0) {
        volRequests.push({
          personId: person.id,
          firstName: person.firstName,
          lastName: person.lastName,
          rut: person.rut,
          role: person.role
        })
      }
    }
    res.json({
      error: null,
      solicitudes: volRequests
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }

});

router.get("/:id/misVoluntarios", userAuth, async (req, res) => {
  try {
    if (req.personRole != "Coordinator") return res.status(403).json({ error: "Debes ser coordinador" });
    
    var volCoord = await req.person.getVolunteer()
    volCoord = await volCoord.getCoordinator()
    if (!volCoord) return res.status(404).json({ error: "Usuario no encontrado" });
    var volRequests = []
    const volunteers = await volCoord.getVolunteerees()
    for (let i = 0; i < volunteers.length; i++) {
      let vol = volunteers[i]
      let person = await vol.getPerson({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'rut',
          'role',
          'status',
          'banned'
        ]
      })
      volRequests.push({
        personId: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        rut: person.rut,
        role: person.role,
        status: person.status,
        banned: person.banned
      })
    }
    res.json({
      error: null,
      voluntarios: volRequests
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }

});

router.patch("/:id/veredictoSolicitud", userAuth, async (req, res) => {
  try {
    if (req.personRole != "Coordinator") return res.status(403).json({ error: "Debes ser coordinador" });
    var volCoord = await req.person.getVolunteer()
    volCoord = await volCoord.getCoordinator()
    if (!volCoord) return res.status(404).json({ error: "Usuario no encontrado" });
    var person = await db.Person.findByPk(req.body.personId)
    if (!person) return res.status(404).json({ error: "Solicitante no encontrado" });
    person.status = req.body.veredict
    await person.save()
    res.json({
      error: null,
      data: 'success'
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})

router.get("/index", async (req, res) => {
  const model = db.Volunteer
    for (let assoc of Object.keys(model.associations)) {
      for (let accessor of Object.keys(model.associations[assoc].accessors)) {
        console.log(model.name + '.' + model.associations[assoc].accessors[accessor]+'()');
      }
    }
  try {
    const coords = await db.Coordinator.findAll()
    for (let i = 0; i < coords.length; i++) {
      const vol = await coords[i].getVolunteer()
      const person = await vol.getPerson()
      coords[i] = {
        id: person.get().id,
        firstName: person.get().firstName,
        lastName: person.get().lastName,
        rut: person.get().rut
      }
    }
    res.json({
      error: null,
      data: coords
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }

})

router.post("/promoverVoluntario", userAuth, async (req, res) => {
  try {
    if (req.personRole != "Coordinator") return res.status(403).json({ error: "Debes ser coordinador" });
    const volPerson = await db.Person.findByPk(req.body.volId) 
    if (!volPerson) return res.status(404).json({ error: "Usuario no encontrado" });
    const vol = await volPerson.getVolunteer()
    if (!vol) return res.status(403).json({ error: "Usuario no es voluntario" });
    var volCoord = await req.person.getVolunteer()
    volCoord = await volCoord.getCoordinator()
    let volunteree = await volCoord.getVolunteerees({
      where: {
        id: vol.get().id
      }
    })
    if (!volunteree) return res.status(403).json({ error: "No eres coordinador de ese voluntario" });
    volunteree = volunteree[0]
    let isPromoted = await volunteree.getCoordinator()
    if (isPromoted) return res.status(409).json({ error: "Usuario ya fue promovido" });
    await volunteree.createCoordinator({})
    volPerson.role = "coordinators"
    await volPerson.save()
    promotionNotification(volPerson, volPerson.get().email)
    return res.status(200).json({ 
      error: null,
      status: "success" 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})

router.post("/bannearVoluntario", userAuth, async (req, res) => {
  try {
    if (req.personRole != "Coordinator") return res.status(403).json({ error: "Debes ser coordinador" });
    const volPerson = await db.Person.findByPk(req.body.volId) 
    console.log(volPerson, !volPerson);
    if (!volPerson) return res.status(404).json({ error: "Usuario no encontrado" });
    const vol = await volPerson.getVolunteer()
    if (!vol) return res.status(403).json({ error: "Usuario no es voluntario" });
    var volCoord = await req.person.getVolunteer()
    volCoord = await volCoord.getCoordinator()
    let volunteree = await volCoord.getVolunteerees({
      where: {
        id: vol.get().id
      }
    })
    if (!volunteree) return res.status(403).json({ error: "No eres coordinador de ese voluntario" });
    volPerson.banned = true
    await volPerson.save()
    console.log(volPerson);
    console.log("EWE");
    const tokens = await volPerson.getTokens()
    console.log(tokens);
    for (let t = 0; t < tokens.length; t++) {
      const token = tokens[t];
      await token?.destroy()
    }
    banNotification(volPerson, req.body.reason)
    return res.status(200).json({ 
      error: null,
      status: "success" 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})


module.exports = router;
