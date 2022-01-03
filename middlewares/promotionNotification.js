const sendMail = require("./mailer")

async function promotionNotification(person, coordMail) {
  sendMail(coordMail, "Has sido promovido en RAFA APP", 
    `Felicitaciones ${person.get().firstName}, has sido promovido a coordinador de voluntarios en RAFA APP`
  );
}

module.exports = promotionNotification;