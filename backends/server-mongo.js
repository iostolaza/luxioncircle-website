require('dotenv').config(); // v17.2.1
const express = require('express'); // v5.1.0
const bodyParser = require('body-parser'); // v2.2.0
const { body, validationResult } = require('express-validator'); // v7.2.1
const mongoose = require('mongoose'); // v8.17.2
const cors = require('cors'); // v2.8.5
const rateLimit = require('express-rate-limit'); // v7.4.1 (new, npm install express-rate-limit@7.4.1)
const app = express();
const port = process.env.PORT || 3000;
// Modular imports
const Contact = require('../models/contact');
const emailService = require('../services/emailService');
// CORS setup (unchanged, with debugging)
const allowedOrigins = ['https://luxioncircle.com', 'https://www.luxioncircle.com', 'http://localhost:3000'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Incoming request:', req.method, req.url, 'Origin:', origin);
  console.log('Origin match check:', allowedOrigins.includes(origin));
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return res.sendStatus(200);
  }
  next();
});
app.options('*', cors());
// Rate limiting for scalability
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../'));
// MongoDB connection with pooling and concurrency
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10, // For performance
  optimisticConcurrency: true, // For scalability
}).then(() => {
  console.log('MongoDB connected');
  // Contact route
  app.post('/api/contact', [
    body('first_name').trim().notEmpty().escape(), // Escape for XSS
    body('last_name').trim().notEmpty().escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().optional({ nullable: true }).escape(),
    body('message').trim().notEmpty().escape()
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
      // Email via service
      await emailService.sendConfirmation(email, `${first_name} ${last_name}`);
      res.status(200).json({ message: 'Success' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  // Static fallback
  app.get('*', (req, res) => {
    res.sendFile(__dirname + '/../index.html');
  });
  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Uncaught error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  });
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
