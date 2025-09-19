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
