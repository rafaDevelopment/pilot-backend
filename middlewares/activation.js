const sendMail = require("./mailer")
const jwt = require("jsonwebtoken");

const TOKEN_SECRET = process.env.TOKEN_SECRET;

async function activateAccount(person) {
  const token = jwt.sign(person.get().email, TOKEN_SECRET);
  sendMail(person.get().email, "Registro APP RAFA", 
    `Hola, puedes activar tu cuenta en el siguiente link:
    
    
    https://app-rafa.vercel.app/activate/${token}`
  );
  person.status = 4
  await person.save()
  setTimeout(async () => {
    await person.reload()
    if (person.status == 4) {
      await person.destroy()
    }
  }, 1000*60*60);
}

module.exports = activateAccount;