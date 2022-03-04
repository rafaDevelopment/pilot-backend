const express = require("express");
const db = require("./models");
const bodyparser = require("body-parser");
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
db.sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection to the database has been established successfully."
    );
    app.listen(PORT, (err) => {
      if (err) {
        return console.error("Failed", err);
      }
      console.log(`Listening on port ${PORT}`);

      const model = db.Person
    for (let assoc of Object.keys(model.associations)) {
      for (let accessor of Object.keys(model.associations[assoc].accessors)) {
        console.log(model.name + '.' + model.associations[assoc].accessors[accessor]+'()');
      }
    }

      return;
    });
  })
  .catch((err) => console.error("Unable to connect to the database:", err));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/patients", require("./routes/patients"));
app.use("/caregivers", require("./routes/caregivers"));
app.use("/volunteers", require("./routes/volunteers"));
app.use("/cesfamCoordinators", require("./routes/cesfamCoordinators"));
app.use("/volunteerCoordinators", require("./routes/volunteerCoordinators"));
app.use("/people", require("./routes/people"));
app.use("/matches", require("./routes/matches"));
app.use("/personalInterests", require("./routes/personalInterests"));
app.use("/activities", require("./routes/activities"));
app.use("/helps", require("./routes/helps"));