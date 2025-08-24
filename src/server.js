require('dotenv').config(); // v17.2.1
const express = require('express'); // v5.1.0
const { validationResult } = require('express-validator'); // v7.2.1 (body moved to controller)
const mongoose = require('mongoose'); // v8.17.2
const cors = require('cors'); // v2.8.5
const rateLimit = require('express-rate-limit'); // v8.0.1
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
// CORS setup (updated to allow undefined origins for same-origin)
const allowedOrigins = ['https://luxioncircle.com', 'https://www.luxioncircle.com', 'http://localhost:3000'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Incoming request:', req.method, req.url, 'Origin:', origin);
  console.log('Origin match check:', allowedOrigins.includes(origin));
  if (!origin || allowedOrigins.includes(origin)) { // Allow undefined (same-origin)
    res.setHeader('Access-Control-Allow-Origin', origin || '*'); // Fallback to * if undefined
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
app.set('trust proxy', 1);
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);
app.use(express.json()); // Replace body-parser
// Serve static from public/
app.use(express.static(path.join(__dirname, '..'), { maxAge: 0 }));
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
}).then(() => {
  console.log('MongoDB connected');
  // Mount modular route
  app.use('/api/contact', require('./routes/contact'));
  // Static fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
  });
  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Uncaught error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
// Export app for testing; listen only if run directly
module.exports = app;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}