const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/auth");
const {registerPerson} = require("../middlewares/globalRegister")
const updatePerson = require("../middlewares/personUpdate")
const db = require("../models");
const activateAccount = require("../middlewares/activation");
const requestNotification = require("../middlewares/requestNotification")

router.post("/register", registerPerson, async (req, res) => {
  try {
    req.person.role = "patients"
    await req.person.save()
    const user = await req.person.createUser({});
    const patient = await user.createPatient({
      religion: req.body.religion,
      hospital: req.body.hospital
    });
    const cesfam = await db.CesfamCoordinator.findByPk(req.body.hospital)
    await patient.setCesfamCoordinator(cesfam)
    activateAccount(req.person)
    requestNotification(req.person, cesfam.get().email, 'register-requests')
    res.json({
      status: "Success"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ "error": "Hubo un error" });
  }
});

router.get("/:id", userAuth, async (req, res) => {
  try {
    if (req.params.id != req.person.get().id) {
      res.status(403).json({error: "Id no coincide con el de usuario"})
      return
    }
    const user = await req.person.getUser()
    const patient = await user.getPatient()
    const pInterests = (await user.getPersonalInterests({
      attributes: ['id', 'name']
    })).map(pInt => ({id: pInt.id, name: pInt.name}))

    const emergencyContacts = (await patient.getEmergencyContacts({
      attributes: ['id', 'relationship', 'name', 'phoneNumber']
    }))

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
      hospital: patient.hospital,
      religion: patient.religion,
      role: req.personRole,
      pInterests,
      // emergencyContacts
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})

router.patch("/:id", userAuth, updatePerson, async (req, res) => {
  try {
    const user = await req.person.getUser()
    const patient = await user.getPatient()

    patient.hospital = req.body.hospital ?? patient.hospital
    patient.religion = req.body.religion ?? patient.religion

    res.status(200).json({
      error: null
    })
  } catch (error) {
    res.status(500).json({ error });
  }
})

router.get("/:id/caregivers", userAuth, async (req, res) => {
  try {
    if (req.params.id != req.person.get().id) {
      res.status(403).json({error: "Id no coincide con el de usuario"})
      return
    }
    const user = await req.person.getUser()
    const patient = await user.getPatient()
    const caregivers = await patient.getCaregivers()
    for (let i = 0; i < caregivers.length; i++) {
      const cg = caregivers[i];
      const cgUser = await cg.getUser()
      const cgPerson = await cgUser.getPerson({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'rut',
          'email',
          'birthDate',
          'comuna',
          'country',
          'civilState',
          'address',
          'gender'
        ]
      }) 
      caregivers[i] = cgPerson
    }  
    res.status(200).json({
      caregivers
    })
  } catch (error) {
    res.status(500).json({ error });
  }
})


router.patch("/:id/addPersonalInterests", userAuth, async (req, res) => {
  try {
    const user = await req.person.getUser()
    const patient = await user.getPatient()
    for (let i = 0; i < req.body.personalInterests.length; i++) {
      const el = req.body.personalInterests[i];
      req.body.personalInterests[i] = await db.PersonalInterest.findByPk(el)
    }
    await user.setPersonalInterests(req.body.personalInterests)

    res.status(200).json({
      error: null
    })
  } catch (error) {
    res.status(500).json({ error });
  }
})

router.post("/checkRut", async (req, res) => {
  const person = await db.Person.findOne({ where: { rut: req.body.rut } });
  if (!person) return res.status(200).json({ response: "Rut inválido" });
  if (person.get().role != "patients") return res.status(200).json({ response: "Rut no es paciente" });
  return res.status(200).json({ response: "Rut válido" })
})

module.exports = router;
