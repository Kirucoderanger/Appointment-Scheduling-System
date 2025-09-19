const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  service: { type: String },
  start: { type: Date, required: true },
  end: { type: Date },
  status: { type: String, enum: ['booked','rescheduled','canceled','completed'], default: 'booked' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.index({ providerId: 1, start: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);