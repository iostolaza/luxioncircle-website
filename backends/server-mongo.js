require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../')); // Serve from project root

// MongoDB setup
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const contactSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// Form submission route (CRUD create only)
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
        console.log('Data saved to Mongo:', newContact); // Log for test
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

app.listen(port, () => {
    console.log('Mongo backend running on http://localhost:' + port);
});
