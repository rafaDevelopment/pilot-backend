const sendMail = require("./mailer")

async function requestNotification(person, coordMail, url) {
  sendMail(coordMail, "Nueva Solicitud RAFA APP", 
    `Hola, tienes una nueva solicitud de RAFA APP, revísala en:
  

    https://app-rafa.vercel.app/${url}`
  );
}

module.exports = requestNotification;