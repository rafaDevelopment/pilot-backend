const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt");
const requestResponse = require("../middlewares/requestReponse")
const jwt = require("jsonwebtoken");
const userAuth = require("../middlewares/authCesfam");
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const banNotification = require("../middlewares/banNotification")

router.post("/login", async (req, res) => {
  try {
    const cesfamCoord = await db.CesfamCoordinator.findOne({ where: { email: req.body.email } });
    if (!cesfamCoord) return res.status(401).json({ error: "Credenciales inválidas" });
    const validPassword = await bcrypt.compare(
      req.body.password || '',
      cesfamCoord.get().password
    );
    if (!validPassword)
      return res.status(401).json({ error: "Credenciales inválidas" });
    const token = jwt.sign("CesfamCoordinator"+","+cesfamCoord.get().id+","+`${Math.random()}`, TOKEN_SECRET);
    await cesfamCoord.createTokenCesfam({ token: token })
    res.json({
      error: null,
      data: "success",
      token: token,
      role: "CesfamCoordinator",
      id: cesfamCoord.get().id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }

});

router.get("/:id", userAuth, async (req, res) => {
  try {
    const cesfamCoord = await db.CesfamCoordinator.findByPk(req.params.id);
    if (!cesfamCoord) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({
      role: "CesfamCoordinator",
      status: 2,
      name: cesfamCoord.get().cesfam,
      email: cesfamCoord.get().email,
      id: cesfamCoord.get().id
      })
  } catch (error){
    console.log(error);
    res.status(500).json({ error: "Hubo un error." });
  }
})

router.get("/:id/misUsuarios", userAuth, async (req, res) => {
  try {
    const cesfamCoord = await db.CesfamCoordinator.findByPk(req.params.id);
    if (!cesfamCoord) return res.status(404).json({ error: "Usuario no encontrado" });
    var userRequests = []
    const patients = await cesfamCoord.getPatients()
    const caregivers = await cesfamCoord.getCaregivers()
    const users = [...patients, ...caregivers]
    for (let i = 0; i < users.length; i++) {
      let patOrCargiv = users[i];
      let user = await patOrCargiv.getUser()
      let person = await user.getPerson({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'rut',
          'role',
          'status',
          'email',
          'birthDate',
          'comuna',
          'country',
          'civilState',
          'address',
          'gender',
          'banned',
          'pictureUrl'
        ]
      })
      userRequests.push(person.get())
    }
    res.json({
      error: null,
      solicitudes: userRequests
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});


router.get("/:id/solicitudes", userAuth, async (req, res) => {
  try {
    const cesfamCoord = await db.CesfamCoordinator.findByPk(req.params.id);
    if (!cesfamCoord) return res.status(404).json({ error: "Usuario no encontrado" });
    var userRequests = []
    const patients = await cesfamCoord.getPatients()
    const caregivers = await cesfamCoord.getCaregivers()
    const users = [...patients, ...caregivers]
    for (let i = 0; i < users.length; i++) {
      let patOrCargiv = users[i];
      let user = await patOrCargiv.getUser()
      let person = await user.getPerson({
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
        userRequests.push({
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
      solicitudes: userRequests
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }

});

router.patch("/:id/veredictoSolicitud", userAuth, async (req, res) => {
  try {
    const cesfamCoord = await db.CesfamCoordinator.findByPk(req.params.id);
  if (!cesfamCoord) return res.status(404).json({ error: "Usuario no encontrado" });
  var person = await db.Person.findByPk(req.body.personId)
  if (!person) return res.status(404).json({ error: "Solicitante no encontrado" });
  if (!requestResponse(person, req.body.veredict)) return res.status(400).json({ error: "Respuesta inválida" });
  person.status = req.body.veredict
  await person.save()
  res.json({
    error: null,
    data: 'success'
  })
}catch (error) {
  console.log(error);
  res.status(500).json({ error });
}
})

router.post("/:id/bannearUsuario", userAuth, async (req, res) => {
  try {
    const cesfamCoord = await db.CesfamCoordinator.findByPk(req.params.id);
  if (!cesfamCoord) return res.status(404).json({ error: "Coordinador no encontrado" });
  var person = await db.Person.findByPk(req.body.personId)
  if (!person) return res.status(404).json({ error: "Usuario no encontrado" });
  person.banned = true
  await person.save()
  const tokens = await person.getTokens()
  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    await token.destroy()
  }
  banNotification(person, req.body.reason)
  res.json({
    error: null,
    data: 'success'
  })
}catch (error) {
  console.log(error);
  res.status(500).json({ error });
}
})

router.get("/", async (req, res) => {
  try {
  const cesfams = await db.CesfamCoordinator.findAll({
    attributes: [
      'id', 'cesfam'
    ]
  })
  res.json({
    error: null,
    data: cesfams
  });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})

router.delete("/logout", userAuth, async (req, res) => {
  const tokenCesfam = await db.TokenCesfam.findOne({ where: { token: req.headers.authorization.replace("Bearer ", "") } });
  const cesfam = req.cesfam;
  try {
    console.log("Removing token");
    console.log(tokenCesfam);
    await tokenCesfam.destroy()
    res.status(200).json({ error: null });
  } catch (error) {
    res.status(500).json({ error: "Hubo un error." })
  }
});


module.exports = router;
