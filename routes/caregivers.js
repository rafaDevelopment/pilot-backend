// const { try } = require("bluebird");
const express = require("express");
const router = express.Router();
const {registerPerson, verificadorRut} = require("../middlewares/globalRegister");
const userAuth = require("../middlewares/auth");
const updatePerson = require("../middlewares/personUpdate")
const activateAccount = require("../middlewares/activation");
const requestNotification = require("../middlewares/requestNotification")
const { Op } = require("sequelize");
const db = require("./../models");


const findPatient = async (req, res, next) => {
  try {
    // if (!verificadorRut.validaRut(req.body.rutPatient.toString())) {
    //   return res.status(400).json({ error: "Rut de paciente inválido" });
    // }
    const patientPerson = await db.Person.findOne({ where: { rut: req.body.rutPatient } });
    if (!patientPerson) return res.status(404).json({ error: "Paciente no existe" });
    const patient = await (await patientPerson.getUser()).getPatient()
    req.patient = patient;
    console.log("2");
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Hubo un error." });
  }
};

router.post("/register", findPatient, registerPerson, async (req, res) => {
  try {
    req.person.role = "caregivers";
    await req.person.save();
    const user = await req.person.createUser({});
    const caregiver = await user.createCaregiver({});
    const patient = req.patient;
    const cesfam = await patient.getCesfamCoordinator()
    await caregiver.setPatients([patient]);
    await caregiver.setCesfamCoordinator(cesfam)
    activateAccount(req.person)
    requestNotification(req.person, cesfam.get().email, 'register-requests')
    console.log(3);
    res.json({
      error: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.get("/:id", userAuth, async (req, res) => {
  try {
    if (req.params.id != req.person.get().id) {
      res.status(403).json({error: "Id no coincide con el de usuario"})
      return
    }
    const user = await req.person.getUser()
    const caregiver = await user.getCaregiver()
    res.status(200).json({
      rut: req.person.rut,
      firstName: req.person.firstName,
      lastName: req.person.lastName,
      email: req.person.email,
      birthDate: req.person.birthDate,
      comuna: req.person.comuna,
      country: req.person.country,
      civilState: req.person.civilState,
      status: req.person.status,
      address: req.person.address,
      gender: req.person.gender,
      banned: req.person.banned,
      pictureUrl: req.person.pictureUrl,
      role: req.personRole,
      personalInterests: await user.getPersonalInterests()
    })
  } catch (error) {
    res.status(500).json({ error });
  }
})

router.get("/:id/patients", userAuth, async (req, res) => {
  try {
    if (req.params.id != req.person.get().id) {
      res.status(403).json({error: "Id no coincide con el de usuario"})
      return
    }
    const user = await req.person.getUser()
    const caregiver = await user.getCaregiver()
    const patients = (await caregiver.getPatients())
    for (let i = 0; i < patients.length; i++) {
      const pat = patients[i];
      const pUser = await pat.getUser()
      const pPerson = await pUser.getPerson({
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
      
      
      let match = await pUser.getMatches({where: {date: {[Op.ne]: null}}});
      // A lo más puede tener un match un paciente
      let volunteer = await match[0]?.getVolunteer();
      let vPerson = await volunteer?.getPerson({
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
      pPerson.volunteer = vPerson 
      patients[i] = pPerson  
    }
    res.status(200).json({
      patients
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})

router.patch("/:id", userAuth, updatePerson, async (req, res) => {
  try {
    const user = await req.person.getUser()
    const caregiver = await user.getCaregiver()

    res.status(200).json({
      error: null
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
})

module.exports = router;
