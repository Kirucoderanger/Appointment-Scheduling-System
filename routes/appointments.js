const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const validate = require('../middlewares/validate');
const { bookAppointment, updateAppointment } = require('../validators/appointment.validator');
const auth = require('../middlewares/auth');


router.post('/', auth(['client']), validate(bookAppointment), appointmentController.book);
router.put('/:id', auth(['client','provider','admin']), validate(updateAppointment), appointmentController.update);
router.get('/me', auth(), appointmentController.getMine);
router.get('/provider/:id', auth(['provider','admin']), appointmentController.getProviderAppointments);
router.get('/all', auth(['admin']), appointmentController.getAll);


module.exports = router;