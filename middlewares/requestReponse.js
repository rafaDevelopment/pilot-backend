const sendMail = require("./mailer")

async function requestResponse (person, veredict) {
  if (veredict == "1") {
    sendMail(person.get().email, "RAFA APP: Solicitud Aceptada", `
      Felicitaciones ${person.get().firstName}, tu solicitud ha sido aceptada!

      Inicia sesión en el siguiente link: https://app-rafa.vercel.app/login
    `) // Completar link
  } else if (veredict = "2") {
    sendMail(person.get().email, "RAFA APP: Solicitud Rechazada", `
      Hola ${person.get().firstName}, tu solicitud ha sido rechazada.
    `)
  } else {
    return false
  }
  return true
}

module.exports = requestResponse;