const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt");

const updatePerson = async (req, res, next) => {
  try {
    if (req.params.id != req.person.get().id) {
      res.status(403).json({error: "Id no coincide con el de usuario"})
      return
    }
    req.person.comuna = req.body.comuna ?? req.person.comuna
    req.person.country =  req.body.country ?? req.person.country
    req.person.civilState = req.body.civilState ?? req.person.civilState
    req.person.address = req.body.address ?? req.person.address
    req.person.gender = req.body.gender ?? req.person.gender
    req.person.pictureUrl = req.body.pictureUrl ?? req.person.pictureUrl
    req.person.status = 3

    await req.person.save()
    await req.person.reload()
    next();
  } catch (error) {
    res.status(500).json({ error });
  }
  return
};

module.exports = updatePerson;