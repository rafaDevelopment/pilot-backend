const express = require("express");
const router = express.Router();
const db = require("../models");
const personAuth = require("../middlewares/auth");

router.get("/", async (req, res) => {
  const personalInterests = await db.PersonalInterest.findAll({
    attributes: ["id", "name"],
  });
  res.json(personalInterests);
});

router.post("/add", personAuth, async (req, res) => {
  try {
    const ids = req.body.ids;
    const personalInterests = await db.PersonalInterest.findAll({
      where: {
        id: ids,
      },
    });
    if (req.personRole == "Patient") {
      const user = await req.person.getUser();
      await user.addPersonalInterests(personalInterests);
      res.json({
        error: null,
      });
    } else if (
      req.personRole == "Volunteer" ||
      req.personRole == "Coordinator"
    ) {
      const volunteer = await req.person.getVolunteer();
      await volunteer.addPersonalInterests(personalInterests);
      res.json({
        error: null,
      });
    } else {
      res.status(403).json({
        error: "Debes ser paciente, voluntario o coordinador.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Hubo un error."
    })
  }
});

module.exports = router;
