require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
const renderMjmlTemplate = require('../utils/renderMjmlTemplate');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration with debugging
const allowedOrigins = [
    'https://luxioncircle.com',
    'https://www.luxioncircle.com',
    'http://localhost:3000'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('Incoming request:', req.method, req.url, 'Origin:', origin);  // Debug all requests
    console.log('Origin match check:', allowedOrigins.includes(origin));  // Debug matching
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight');  // Debug preflight
        return res.sendStatus(200);
    }
    next();
});

// Global pre-flight handler
app.options('*', cors());

app.use(bodyParser.json());
app.use(express.static(__dirname + '/../'));

// MongoDB setup (unchanged)
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');

        // Form submission route (unchanged, assuming email is integrated)
        app.post('/api/contact', [
            body('first_name').trim().notEmpty(),
            body('last_name').trim().notEmpty(),
            body('email').isEmail(),
            body('phone').trim().optional({ nullable: true }),
            body('message').trim().notEmpty()
        ], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { first_name, last_name, email, phone, message } = req.body;

            try {
                const newContact = new Contact({ first_name, last_name, email, phone, message });
                await newContact.save();
                console.log('Data saved to Mongo:', newContact);

                // Email confirmation
                const transporter = nodemailer.createTransport({
                    host: 'smtp.zoho.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
                try {
                    const emailHtml = await renderMjmlTemplate(
                        path.join(__dirname, '../email/confirmation.mjml'),
                        { name: `${first_name} ${last_name}` }
                    );
                    await transporter.sendMail({
                        from: `"Luxion Circle" <${process.env.SMTP_USER}>`,
                        to: email,
                        subject: "We received your message!",
                        html: emailHtml,
                    });
                    console.log('Confirmation email sent to:', email);
                } catch (mailErr) {
                    console.warn('Confirmation email failed:', mailErr);
                }

                res.status(200).json({ message: 'Success' });
            } catch (err) {
                console.error('Save error:', err);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // Serve static fallback
        app.get('*', (req, res) => {
            res.sendFile(__dirname + '/../index.html');
        });

        // Global error handler
        app.use((err, req, res, next) => {
            console.error('Uncaught error:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        });

        app.listen(port, () => {
            console.log(`Mongo backend running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const contactSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);