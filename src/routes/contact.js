const express = require('express'); // v5.1.0 (updated to latest)
const { body } = require('express-validator'); // v7.2.1
const contactController = require('../controllers/contactController');

const router = express.Router();

router.post('/', [
  body('first_name').trim().notEmpty().escape(),
  body('last_name').trim().notEmpty().escape(),
  body('email').trim().escape().isEmail().normalizeEmail({ 
    all_lowercase: true, 
    gmail_remove_dots: false 
  }), // Configured: Validate, lowercase, preserve dots
  body('phone').trim().optional({ nullable: true }).escape(),
  body('message').trim().notEmpty().escape()
], contactController.postContact);

module.exports = router;