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

exports.delete = asyncHandler(async (req, res) => {
  const deleted = await appointmentService.deleteAppointment(req.params.id, req.user);
  res.json(deleted);
});






/*
const appointmentService = require('../services/appointmentService');

// Book a new appointment
exports.createAppointment = async (req, res, next) => {
  try {
    const clientId = req.user.id; // comes from auth middleware
    const { providerId, start, end, service, notes } = req.body;

    if (!providerId || !start) {
      return res.status(400).json({ message: 'providerId and start are required' });
    }

    const appointment = await appointmentService.bookAppointment(clientId, {
      providerId,
      start,
      end,
      service,
      notes
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

// Update an existing appointment
exports.updateAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const user = req.user;
    const updated = await appointmentService.updateAppointment(appointmentId, req.body, user);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Get appointments for the logged-in client
exports.getUserAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentService.getAppointmentsForUser(userId);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

// Get appointments for a provider
exports.getProviderAppointments = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const appointments = await appointmentService.getAppointmentsForProvider(providerId);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

// Get all appointments (admin only)
exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};
*/