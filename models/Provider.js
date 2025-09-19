const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: String,
  // store availability as array of ISO strings or embedded objects
  availableSlots: [{ start: Date, end: Date }]
});

module.exports = mongoose.model('Provider', providerSchema);
