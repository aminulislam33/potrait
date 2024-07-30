const nodemailer = require('nodemailer');

async function handleSendEmail(email, subject, text){

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            }
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text
        });
    } catch (error) {
        console.log(error)
    }
};

module.exports = handleSendEmail;