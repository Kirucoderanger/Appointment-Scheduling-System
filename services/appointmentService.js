const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');

exports.bookAppointment = async (clientId, data) => {
  const { userId, start, end, service, notes } = data;
  const provider = await Provider.findById(userId);
  if (!provider) {
    const err = new Error('Provider not found'); err.statusCode = 404; throw err;
  }

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;
  if (endDate < startDate) {
    const err = new Error('End must be after start'); err.statusCode = 400; throw err;
  }

  // check clash with existing appointments for provider
  const clash = await Appointment.findOne({
    providerId: new mongoose.Types.ObjectId(providerId),
    $or: [
      { start: { $lt: endDate }, end: { $gt: startDate } },
      { start: { $eq: startDate } }
    ]
  });
  if (clash) {
    const err = new Error('Slot unavailable'); err.statusCode = 409; throw err;
  }

  const appointment = await Appointment.create({ clientId, providerId, service, start: startDate, end: endDate, notes });
  return appointment;
};

exports.updateAppointment = async (id, data, user) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) { const err = new Error('Appointment not found'); err.statusCode = 404; throw err; }

  // authorization: client who owns it, provider of it, or admin
  const allowed = user.role === 'admin' ||
  (user.role === 'provider' && appointment.providerId?.toString() === user.id.toString()) ||
  (user.role === 'client' && appointment.clientId?.toString() === user.id.toString());
  if (!allowed) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }

  if (data.start || data.end) {
    const startDate = data.start ? new Date(data.start) : appointment.start;
    const endDate = data.end ? new Date(data.end) : appointment.end || startDate;
    if (endDate < startDate) { const err = new Error('End must be after start'); err.statusCode = 400; throw err; }

    // check clash
    const clash = await Appointment.findOne({
      _id: { $ne: appointment._id },
      providerId: appointment.providerId,
      $or: [
        { start: { $lt: endDate }, end: { $gt: startDate } },
        { start: { $eq: startDate } }
      ]
    });
    if (clash) { const err = new Error('Slot unavailable'); err.statusCode = 409; throw err; }

    appointment.start = startDate;
    appointment.end = endDate;
  }

  if (data.status) appointment.status = data.status;
  if (data.notes) appointment.notes = data.notes;

  await appointment.save();
  return appointment;
};

exports.getAppointmentsForUser = async (userId) => {
  return Appointment.find({ clientId: userId }).populate('providerId').sort({ start: 1 });
};

exports.getAppointmentsForProvider = async (providerId) => {
  return Appointment.find({ providerId }).populate('clientId').sort({ start: -1 });
};

exports.getAllAppointments = async () => {
  return Appointment.find().populate('clientId providerId').sort({ start: -1 });
};

exports.deleteAppointment = async (id, user) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization: client, provider, or admin
  const allowed = user.role === 'admin' ||
  (user.role === 'provider' && appointment.providerId?.toString() === user.id.toString()) ||
  (user.role === 'client' && appointment.clientId?.toString() === user.id.toString());
  if (!allowed) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  await appointment.deleteOne();
  return appointment;
};

exports.cancelAppointment = async (id, user, reason) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const allowed = user.role === 'admin' ||
  (user.role === 'provider' && appointment.providerId?.toString() === user.id.toString()) ||
  (user.role === 'client' && appointment.clientId?.toString() === user.id.toString());
  if (!allowed) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  appointment.status = 'canceled';
  appointment.notes = reason || appointment.notes;

  await appointment.save();
  return appointment;
};








/*
const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');

// Book a new appointment
exports.bookAppointment = async (clientId, data) => {
  const { providerId, start, end, service, notes } = data;

  const provider = await Provider.findById(providerId);
  if (!provider) {
    const err = new Error('Provider not found');
    err.statusCode = 404;
    throw err;
  }

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;
  if (endDate < startDate) {
    const err = new Error('End must be after start');
    err.statusCode = 400;
    throw err;
  }

  // Check clash with existing appointments
  const clash = await Appointment.findOne({
    providerId: new mongoose.Types.ObjectId(providerId),
    $or: [
      { start: { $lt: endDate }, end: { $gt: startDate } },
      { start: { $eq: startDate } }
    ]
  });
  if (clash) {
    const err = new Error('Slot unavailable');
    err.statusCode = 409;
    throw err;
  }

  const appointment = await Appointment.create({
    clientId: new mongoose.Types.ObjectId(clientId),
    providerId: new mongoose.Types.ObjectId(providerId),
    service,
    start: startDate,
    end: endDate,
    notes
  });

  return appointment;
};

// Update an existing appointment
exports.updateAppointment = async (id, data, user) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization: client, provider, or admin
  const allowed =
    user.role === 'admin' ||
    (user.role === 'provider' && appointment.providerId.equals(user.id)) ||
    (user.role === 'client' && appointment.clientId.equals(user.id));
  if (!allowed) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (data.start || data.end) {
    const startDate = data.start ? new Date(data.start) : appointment.start;
    const endDate = data.end ? new Date(data.end) : appointment.end || startDate;

    if (endDate < startDate) {
      const err = new Error('End must be after start');
      err.statusCode = 400;
      throw err;
    }

    // Check clash
    const clash = await Appointment.findOne({
      _id: { $ne: appointment._id },
      providerId: appointment.providerId,
      $or: [
        { start: { $lt: endDate }, end: { $gt: startDate } },
        { start: { $eq: startDate } }
      ]
    });
    if (clash) {
      const err = new Error('Slot unavailable');
      err.statusCode = 409;
      throw err;
    }

    appointment.start = startDate;
    appointment.end = endDate;
  }

  if (data.status) appointment.status = data.status;
  if (data.notes) appointment.notes = data.notes;

  await appointment.save();
  return appointment;
};

// Get all appointments for a client
exports.getAppointmentsForUser = async (userId) => {
  return Appointment.find({ clientId: new mongoose.Types.ObjectId(userId) })
    .populate('providerId')
    .sort({ start: 1 });
};

// Get all appointments for a provider
exports.getAppointmentsForProvider = async (providerId) => {
  return Appointment.find({ providerId: new mongoose.Types.ObjectId(providerId) })
    .populate('clientId')
    .sort({ start: -1 });
};

// Get all appointments (admin)
exports.getAllAppointments = async () => {
  return Appointment.find()
    .populate('clientId providerId')
    .sort({ start: -1 });
};



*/





/*const Appointment = require('../models/Appointment');
const endDate = end ? new Date(end) : startDate;
if (endDate < startDate) {
const err = new Error('End must be after start'); err.statusCode = 400; throw err;
}


const clash = await Appointment.findOne({
providerId: mongoose.Types.ObjectId(providerId),
$or: [
{ start: { $lt: endDate }, end: { $gt: startDate } },
{ start: { $eq: startDate } }
]
});
if (clash) {
const err = new Error('Slot unavailable'); err.statusCode = 409; throw err;
}


const appointment = await Appointment.create({ clientId, providerId, service, start: startDate, end: endDate, notes });
return appointment;
};


exports.updateAppointment = async (id, data, user) => {
const appointment = await Appointment.findById(id);
if (!appointment) { const err = new Error('Appointment not found'); err.statusCode = 404; throw err; }


const allowed = (user.role === 'admin') || (user.role === 'provider' && appointment.providerId.equals(user.id)) || (user.role === 'client' && appointment.clientId.equals(user.id));
if (!allowed) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }


if (data.start || data.end) {
const startDate = data.start ? new Date(data.start) : appointment.start;
const endDate = data.end ? new Date(data.end) : appointment.end || startDate;
if (endDate < startDate) { const err = new Error('End must be after start'); err.statusCode = 400; throw err; }


const clash = await Appointment.findOne({
_id: { $ne: appointment._id },
providerId: appointment.providerId,
$or: [
{ start: { $lt: endDate }, end: { $gt: startDate } },
{ start: { $eq: startDate } }
]
});
if (clash) { const err = new Error('Slot unavailable'); err.statusCode = 409; throw err; }


appointment.start = startDate;
appointment.end = endDate;
}


if (data.status) appointment.status = data.status;
if (data.notes) appointment.notes = data.notes;


await appointment.save();
return appointment;
};


exports.getAppointmentsForUser = async (userId) => {
return Appointment.find({ clientId: userId }).populate('providerId').sort({ start: 1 });
};


exports.getAppointmentsForProvider = async (providerId) => {
return Appointment.find({ providerId }).populate('clientId').sort({ start: -1 });
};


exports.getAllAppointments = async () => {
return Appointment.find().populate('clientId providerId').sort({ start: -1 });
};*/