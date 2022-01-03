const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt");

const registerPerson = async (req, res, next) => {
  try {
    const emailExists = await db.Person.findAll({
      where: {
        email: req.body.email,
      },
    });

    if (emailExists.length != 0) {
      return res.status(409).json({ error: "Este usuario ya existe" });
    }
    if (!verificadorRut.validaRut(req.body.rut.toString())) {
      return res.status(400).json({ error: "Rut inválido" });
    } 
    if (req.body.password.search(/[a-z]/) ==-1 || req.body.password.search(/[0-9]/) == -1 || req.body.password.search(/[A-Z]/) == -1 || req.body.password.length < 6){
      return res.status(400).json({ error: "Contraseña inválida"})
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    let birthDate = req.body.birthDate;
    if (birthDate)
    {
      birthDate = Date.parse(birthDate);
    }
    const person = await db.Person.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: password,
      rut: req.body.rut,
      birthDate: Date.parse(req.body.birthDate) || null,
      comuna: req.body.comuna,
      country: req.body.country,
      civilState: req.body.civilState,
      status: 0,
      address: req.body.address,
      gender: req.body.gender,
      banned: false,
      pictureUrl: req.body.pictureUrl
    });
    req.person = person
    console.log("1");
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ 'error': 'Hubo un error' });
  }
  return
};


const verificadorRut = {
	// Valida el rut con su cadena completa "XXXXXXXX-X"
	validaRut : function (rutCompleto) {
		if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test( rutCompleto ))
			return false;
		var tmp 	= rutCompleto.split('-');
		var digv	= tmp[1]; 
		var rut 	= tmp[0];
		if ( digv == 'K' ) digv = 'k' ;
		return (verificadorRut.dv(rut) == digv );
	},
	dv : function(T){
		var M=0,S=1;
		for(;T;T=Math.floor(T/10))
			S=(S+T%10*(9-M++%6))%11;
		return S?S-1:'k';
	}
}

module.exports = {
  registerPerson,
  verificadorRut
};