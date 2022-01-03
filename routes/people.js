const express = require("express");
const router = express.Router();
const db = require("./../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/auth");
require("dotenv").config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;

router.post("/login", async (req, res) => {
  const person = await db.Person.findOne({ where: { email: req.body.email } });
  if (!person) return res.status(401).json({ error: "Credenciales inválidas" });
  if (person.banned) return res.status(403).json({ error: "Estás banneado de RAFA" });
  if (person.status == 0) return res.status(403).json({ error: "Aún no has sido aceptado" });
  if (person.status == 2) return res.status(403).json({ error: "Has sido rechazado" });
  const validPassword = await bcrypt.compare(
    req.body.password,
    person.get().password
  );
  if (!validPassword)
    return res.status(401).json({ error: "Credenciales inválidas" });
    
  const token = jwt.sign(person.get().role+","+person.get().id+","+await person.countTokens(), TOKEN_SECRET);
  await person.createToken({token: token});
  res.json({
    error: null,
    data: "success",
    token: token,
    role: person.get().role,
    id: person.get().id
  });
});

router.patch("/activate/:token", async (req, res) => {
  try {
    const token = req.params.token
    let decodedToken = jwt.verify(req.params.token, TOKEN_SECRET)
    const person = await db.Person.findOne({ where: { email: decodedToken } });
    person.status = 0
    await person.save()
    res.status(200).json({ 
      error: null,
      rol: person.role
     })
    
  } catch (error) {
    res.status(500).json({ error: "Hubo un error." })
  }
})

router.delete("/logout", userAuth, async (req, res) => {
  const tokenPerson = await db.Token.findOne({ where: { token: req.headers.authorization.replace("Bearer ", "") } });
  const person = req.person;
  try {
    await tokenPerson.destroy()
    res.status(200).json({ error: null });
  } catch (error) {
    res.status(500).json({ error: "Hubo un error." })
  }
});

router.delete("/delete", userAuth, async (req, res) => {
  const person = req.person;
  try {
    await person.destroy();
    res.status(200).json({ error: null });
  } catch (error) {
    res.status(500).json({ error: "Hubo un error." });
  }
});

router.post("/checkEmail", async (req, res) => {
  const person = await db.Person.findOne({ where: { email: req.body.email } });
  if (!person) return res.status(200).json({ response: "Email válido" });
  return res.status(409).json({ response: "Email ya existe" })
})

router.post("/checkRut", async (req, res) => {
  const person = await db.Person.findOne({ where: { rut: req.body.rut } });
  if (!person) return res.status(200).json({ response: false });
  return res.status(200).json({ response: true });
})

router.post("/isLogged", userAuth, async (req, res) => {
  return res.status(200).json({ response: "Usuario Loggeado" })
})

module.exports = router;
