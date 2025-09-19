# Appointment Scheduling System — MVC (Node/Express/Mongo)

This single file contains a ready-to-paste project scaffold. Each file is separated by a clear header: `// === FILE: <path> ===` so you can split them into separate files in your project directory.

// === FILE: package.json ===
{
  "name": "appointment-scheduling-system",
  "version": "1.0.0",
  "description": "Role-based Appointment Scheduling API (Node.js, Express, MongoDB)",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.3.0",
    "morgan": "^1.10.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^4.6.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}

// === FILE: .env.example ===
MONGO_URI=mongodb://localhost:27017/appointments
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

// === FILE: src/app.js ===
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDb = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// connect database
connectDb(process.env.MONGO_URI);

// middlewares
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/providers', require('./routes/providers'));

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// error handler (last)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// === FILE: src/config/db.js ===
const mongoose = require('mongoose');

module.exports = (uri) => {
  if (!uri) throw new Error('MONGO_URI required');
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error', err);
      process.exit(1);
    });
};

// === FILE: src/models/User.js ===
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client','provider','admin'], default: 'client' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

// === FILE: src/models/Provider.js ===
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String },
  availableSlots: [{ start: Date, end: Date }]
});

module.exports = mongoose.model('Provider', providerSchema);

// === FILE: src/models/Appointment.js ===
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

// === FILE: src/middlewares/asyncHandler.js ===
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// === FILE: src/middlewares/errorHandler.js ===
module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const payload = {
    message: err.message || 'Internal Server Error'
  };
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
};

// === FILE: src/middlewares/validate.js ===
const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const toValidate = {};
  if (schema.params) toValidate.params = req.params;
  if (schema.query) toValidate.query = req.query;
  if (schema.body) toValidate.body = req.body;

  const { error, value } = Joi.object(schema).unknown(true).validate(toValidate, { abortEarly: false });
  if (error) {
    const err = new Error('Validation Error');
    err.statusCode = 400;
    err.details = error.details.map(d => ({ path: d.path, message: d.message }));
    return next(err);
  }

  // optionally overwrite validated parts
  if (value.body) req.body = value.body;
  if (value.params) req.params = value.params;
  if (value.query) req.query = value.query;
  next();
};

module.exports = validate;

// === FILE: src/middlewares/auth.js ===
const jwt = require('jsonwebtoken');

module.exports = (roles = []) => (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Authorization header missing' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // should include id and role
    if (roles && roles.length && !roles.includes(payload.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// === FILE: src/validators/auth.validator.js ===
const Joi = require('joi');

module.exports = {
  register: {
    body: Joi.object({
      name: Joi.string().min(2).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('client','provider','admin').optional()
    })
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }
};

// === FILE: src/validators/appointment.validator.js ===
const Joi = require('joi');

module.exports = {
  bookAppointment: {
    body: Joi.object({
      providerId: Joi.string().required(),
      service: Joi.string().required(),
      start: Joi.date().iso().required(),
      end: Joi.date().iso().optional(),
      notes: Joi.string().max(500).optional()
    })
  },
  updateAppointment: {
    params: Joi.object({ id: Joi.string().required() }),
    body: Joi.object({
      start: Joi.date().iso().optional(),
      end: Joi.date().iso().optional(),
      status: Joi.string().valid('booked','rescheduled','canceled','completed').optional(),
      notes: Joi.string().optional()
    }).min(1)
  }
};

// === FILE: src/controllers/authController.js ===
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');
const asyncHandler = require('../middlewares/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use'); err.statusCode = 409; throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: role || 'client' });

  // if provider, create provider doc
  if (role === 'provider') {
    await Provider.create({ userId: user._id });
  }

  res.status(201).json({ id: user._id, email: user.email });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials'); err.statusCode = 401; throw err;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error('Invalid credentials'); err.statusCode = 401; throw err;
  }
  const payload = { id: user._id, role: user.role, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.json({ token });
});

// === FILE: src/controllers/appointmentController.js ===
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

// === FILE: src/services/appointmentService.js ===
const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');

exports.bookAppointment = async (clientId, data) => {
  const { providerId, start, end, service, notes } = data;
  const provider = await Provider.findById(providerId);
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

  // authorization: client who owns it, provider of it, or admin
  const allowed = (user.role === 'admin') || (user.role === 'provider' && appointment.providerId.equals(user.id)) || (user.role === 'client' && appointment.clientId.equals(user.id));
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

// === FILE: src/routes/auth.js ===
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { register, login } = require('../validators/auth.validator');

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post('/register', validate(register), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT
 *     tags: [Auth]
 */
router.post('/login', validate(login), authController.login);

module.exports = router;

// === FILE: src/routes/appointments.js ===
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const validate = require('../middlewares/validate');
const { bookAppointment, updateAppointment } = require('../validators/appointment.validator');
const auth = require('../middlewares/auth');

/**
 * @openapi
 * /appointments:
 *   post:
 *     summary: Book an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth(['client']), validate(bookAppointment), appointmentController.book);

/**
 * @openapi
 * /appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth(['client','provider','admin']), validate(updateAppointment), appointmentController.update);

router.get('/me', auth(), appointmentController.getMine);
router.get('/provider/:id', auth(['provider','admin']), appointmentController.getProviderAppointments);
router.get('/all', auth(['admin']), appointmentController.getAll);

module.exports = router;

// === FILE: src/routes/providers.js ===
const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const auth = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');

// simple providers list
router.get('/', asyncHandler(async (req, res) => {
  const list = await Provider.find().populate('userId', 'name email');
  res.json(list);
}));

// provider sets availability
router.put('/:id/availability', auth(['provider']), asyncHandler(async (req, res) => {
  const { slots } = req.body; // expected [{start,end}]
  const provider = await Provider.findById(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Not found' });
  // authorization: user must be owner or admin
  if (req.user.role !== 'admin' && provider.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  provider.availableSlots = slots.map(s => ({ start: new Date(s.start), end: new Date(s.end) }));
  await provider.save();
  res.json(provider);
}));

module.exports = router;

// === FILE: src/docs/swagger.js ===
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Appointment Scheduling API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        BookAppointment: {
          type: 'object',
          required: ['providerId','service','start'],
          properties: {
            providerId: { type: 'string' },
            service: { type: 'string' },
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time' },
            notes: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);

// === FILE: README.md ===
/*
# Appointment Scheduling System

A role-based appointment scheduling API built with Node.js, Express, MongoDB (Mongoose). Includes validation (Joi), centralized error handling, and Swagger docs.

## Quick start
1. Copy files into project structure.
2. `cp .env.example .env` and set `MONGO_URI` & `JWT_SECRET`.
3. `npm install`
4. `npm run dev`
5. Open `http://localhost:3000/api/docs`

## Notes
- Use Postman or Swagger UI to test endpoints.
- Add production-grade logging and rate-limiting for real deployments.
- Consider MongoDB transactions for multi-document operations.
*/

// === END OF FILES ===
