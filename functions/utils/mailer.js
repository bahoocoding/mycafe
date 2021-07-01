const nodemailer =require("nodemailer");
const config=require("../config");
const dotenv =require("dotenv");
dotenv.config();
const transporter=nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.GOOGLE_USER,
    pass: config.GOOGLE_PASSWORD,
  },
});

module.exports= {
  sendEmail: (toMail, subject, html)=>{
    const mailOptions= {
      from: config.GOOGLE_USER,
      to: toMail,
      subject: subject,
      html: html,
    };
    return transporter.sendMail(mailOptions);
  },
};
