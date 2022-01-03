const express = require("express");
const userAuth = require("../middlewares/auth");
const router = express.Router();
const db = require("../models");
const sendMail = require("../middlewares/mailer");
const { Op } = require("sequelize");



router.post("/new", userAuth, async (req, res) => {
	const person = req.person;
	const user = await person.getUser();

	if (!user)
	{
		res.status(403).json({
      error: "Para solicitar ayuda debes ser cuidador o paciente.",
    });
    return ;
	}
	await user.createHelp({
		startDate: req.body.startDate,
		endDate: req.body.endDate,
		description: req.body.description,
		title: req.body.title
	})
	res.status(200).json({error: null});
})

router.get("/", userAuth, async (req, res) => {
	const person = req.person;
	const volunteer = await person.getVolunteer();

	if (!volunteer)
	{
		return res.status(403).json({
      error: "Para visualizar las ayudas debes ser voluntario.",
    });
	}
	let dateCompare = new Date();
	dateCompare.setHours(dateCompare.getHours()+1);

	const helps = await db.Help.findAll({
		where: {
			endDate: {
				[Op.gte]: dateCompare
			}
		},
		order: ['endDate']
	})
	let finalHelps = [];
	for (var i = 0; i < helps.length; i++) {
		let help = helps[i];
		let volunteer = await help.getVolunteer();
		if (!volunteer)
		{
			let user = await help.getUser();
			let userPerson = await user.getPerson({
				attributes: ['firstName', 'lastName', 'comuna']
			});
			help = {
				startDate: help.get('startDate'),
				endDate: help.get('endDate'),
				description: help.get('description'),
				title: help.get('title'),
				id: help.get('id')
			}
			finalHelps.push({data: help, user: userPerson})
		}
	}

	res.json(finalHelps);

})

router.post("/accept", userAuth, async(req, res) => {
	const person = req.person;
	const volunteer = await person.getVolunteer();
	if (!volunteer)
	{
		return res.status(403).json({
      error: "Para visualizar las ayudas debes ser voluntario.",
    });
	}

	let help = await db.Help.findByPk(req.body.id);
	if (await help.getVolunteer())
	{
		return res.status(409).json({
			error: "Ya hay un voluntario viendo esto!"
		})
		return ;
	}
	let user = await help.getUser();
	let userPerson = await user.getPerson();
	await help.setVolunteer(volunteer);

	sendMail(person.get().email, "Solicitud de ayuda RAFA", 
    `Gracias por aceptar la solicitud de ayuda de ${userPerson.get().firstName} ${userPerson.get().lastName},
    a continuación te dejamos su correo ${userPerson.get().email} para que lo contactes.`
  );

	sendMail(userPerson.get().email, "Solicitud de ayuda aceptada!", 
		`${person.get().firstName} ${person.get().lastName} acaba de aceptar tu solicitud, pronto se contactará contigo por mail.
		Mantente atento!`
	)
	res.json({error: null, msg: 'Revisa tu correo por favor!'});
})

router.get("/accepted", userAuth, async(req, res) =>{
	const person = req.person;
	const volunteer = await person.getVolunteer();
	if (!volunteer)
	{
		return res.status(403).json({

			error: "Para visualizar las ayudas que has aceptado debes ser voluntario."
		})
	}
	let helps = await volunteer.getHelp();
	resJson = [];
	for (var i = 0; i < helps.length; i++) {
		let help = helps[i];
		let user = await help.getUser();
		let userPerson = await user.getPerson({
			attributes: ['firstName', 'lastName', 'comuna']
		});
		help = {
				startDate: help.get('startDate'),
				endDate: help.get('endDate'),
				description: help.get('description'),
				title: help.get('title')
			}
		resJson.push({data: help, user: userPerson})
	}
	res.json(resJson);
})


module.exports = router;