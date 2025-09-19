const asyncHandler = require('../middlewares/asyncHandler');
const appointmentService = require('../services/appointmentService');

exports.book = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id || req.user.id; // depending on jwt payload
  const appointment = await appointmentService.bookAppointment(userId, req.body);
  res.status(201).json(appointment);
});

exports.update = asyncHandler(async (req, res) => {
  const updated = await appointmentService.updateAppointment(req.params.id, req.body, req.user);
  res.json(updated);
});

exports.getMine = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const items = await appointmentService.getAppointmentsForUser(id);
  res.json(items);
});

exports.getProviderAppointments = asyncHandler(async (req, res) => {
  const providerId = req.params.id;
  const items = await appointmentService.getAppointmentsForProvider(providerId);
  res.json(items);
});

exports.getAll = asyncHandler(async (req, res) => {
  const items = await appointmentService.getAllAppointments();
  res.json(items);
});
