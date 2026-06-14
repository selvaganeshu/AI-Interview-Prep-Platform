const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('Email credentials not configured. Reset link:');
    console.log(message);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"AI Interview Prep" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject,
    html: message,
  });
};

module.exports = sendEmail;
