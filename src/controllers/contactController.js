const { validationResult } = require('express-validator'); // v7.2.1
const Contact = require('../models/contact');
const emailService = require('../services/emailService');
const { appendToSheet } = require('../utils/googleSheets');

exports.postContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { first_name, last_name, email, phone, message } = req.body;
  try {
    const newContact = new Contact({ first_name, last_name, email, phone, message });
    await newContact.save();
    console.log('Data saved to Mongo:', newContact);
    try {
      await emailService.sendConfirmation(email, `${first_name} ${last_name}`.trim() || 'Valued Customer');

      // New: Notify client
      await emailService.sendNotificationToClient(newContact);

      // New: Append to Google Sheet
      await appendToSheet(newContact);
      
    } catch (emailErr) {
      console.error('Email failed but DB saved:', emailErr); // Graceful: Log but don't fail response
    }
    res.status(200).json({ message: 'Success' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};