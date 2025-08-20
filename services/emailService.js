const nodemailer = require('nodemailer'); // v7.0.5
const path = require('path');
const renderMjmlTemplate = require('../utils/renderMjmlTemplate'); // Unchanged
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
async function sendConfirmation(to, name) {
  try {
    const emailHtml = await renderMjmlTemplate(
      path.join(__dirname, '../email/confirmation.mjml'),
      { name }
    );
    await transporter.sendMail({
      from: `"Luxion Circle" <${process.env.SMTP_USER}>`,
      to,
      subject: "We received your message!",
      html: emailHtml, // Minify in production: pass { minify: true } to mjml2html if needed
    });
    console.log('Confirmation email sent to:', to);
  } catch (err) {
    console.warn('Email failed:', err);
    throw err; // Rethrow for caller handling
  }
}
module.exports = { sendConfirmation };
