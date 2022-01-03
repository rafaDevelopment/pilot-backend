const db = require("./../models");
const findRole = require("./findRole");

const userAuth = async (req, res, next) => {
  console.log(req.headers);
  const authorization = req.headers.authorization;
  console.log(authorization);
  const token = authorization?.replace("Bearer ", "");
  console.log(token);
  try {
    const tokenPerson = await db.Token.findOne({ where: { token: token } });
    const person = await tokenPerson?.getPerson();
    if (person) {
      req.person = person;
      req.personRole = await findRole(person);
      next();
    } else {
      res.status(401).json({ error: "Debes iniciar sesión" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error" });
  }
};
module.exports = userAuth;
