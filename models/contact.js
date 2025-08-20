const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { optimisticConcurrency: true }); // Enable here for model-level concurrency
// Pre-save hook for any custom logic
contactSchema.pre('save', function(next) {
  // e.g., trim fields if needed
  next();
});
module.exports = mongoose.model('Contact', contactSchema);