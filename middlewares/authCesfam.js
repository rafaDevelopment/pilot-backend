const db = require("./../models");

const cesfamAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");
  try {
    const tokenCesfam = await db.TokenCesfam.findOne({ where: { token: token } });
    const cesfam = await tokenCesfam?.getCesfamCoordinator();
    if (cesfam) {
      req.cesfam = cesfam;
      next();
    } else {
      res.status(401).json({ error: "Debes iniciar sesión" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Debes iniciar sesión" });
  }
};
module.exports = cesfamAuth;
