const nodemailer = require("nodemailer");

async function sendMail(destinatary, subject, text) {

    let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "voluntariadorafa@gmail.com",
        pass: "X5rSu7BNmzyfzSV",
    },
    });

    let mailDetails = {
    from: "voluntariadorafa@gmail.com",
    to: destinatary,
    subject: subject,
    text: text,
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
        console.log(err);
        console.log("Error Occurs");
    } else {
        console.log("Email sent successfully");
    }
    });
}
module.exports = sendMail;