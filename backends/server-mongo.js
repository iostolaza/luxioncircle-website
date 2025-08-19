require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const mjml2html = require('mjml');
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files
// MongoDB setup
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
const contactSchema = new mongoose.Schema({
name: String,
email: String,
message: String,
date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);
// Email transporter
const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
    }
});
// MJML email template function
function generateConfirmationEmail(name, email) {
const mjmlTemplate = `
        <mjml>
            <mj-body background-color="#FFFDF9">
                <mj-section>
                    <mj-column>
                        <mj-text font-size="20px" color="#003366">Thank You, ${name}!</mj-text>
                        <mj-text>We have received your information and will get back to you soon.</mj-text>
                    </mj-column>
                </mj-section>
            </mj-body>
        </mjml>
    `;
const { html } = mjml2html(mjmlTemplate);
return html;
}
// Form submission route
app.post('/api/contact', [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('message').trim().notEmpty()
], async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
    }
const { name, email, message } = req.body;
try {
// Store in MongoDB
const newContact = new Contact({ name, email, message });
await newContact.save();
// Send confirmation email
const html = generateConfirmationEmail(name, email);
await transporter.sendMail({
from: process.env.EMAIL_USER,
to: email,
subject: 'Confirmation: Information Received',
            html
        });
        res.status(200).json({ message: 'Success' });
    } catch (err) {
console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Serve other pages (since static, but ensure routing)
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/../public/index.html'); // Fallback, but static handles
});
app.listen(port, () => {
console.log(`Mongo backend running on http://localhost:${port}`);
});
