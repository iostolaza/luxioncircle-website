const express = require('express'); // v4.19.2
const { body } = require('express-validator'); // v7.2.0
const contactController = require('../controllers/contactController');

const router = express.Router();

router.post('/', [
  body('first_name').trim().notEmpty().escape(),
  body('last_name').trim().notEmpty().escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().optional({ nullable: true }).escape(),
  body('message').trim().notEmpty().escape()
], contactController.postContact);

module.exports = router;