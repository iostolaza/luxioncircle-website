const mongoose = require('mongoose'); // v8.17.2
const contactSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { optimisticConcurrency: true });

contactSchema.pre('save', function(next) {
  next();
});
module.exports = mongoose.model('Contact', contactSchema);