const sendMail = require("./mailer")

async function banNotification(person, reason) {
  sendMail(person.get().email, "Has sido banneado en RAFA APP", 
    `Hola ${person.get().firstName}, has sido banneado de RAFA APP por la siguiente razón:
    
    ${reason}

    `
  );
}

module.exports = banNotification;