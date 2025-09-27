const joi = require('joi');

module.exports = {
  createProvider: {
    body: joi.object({
      userId: joi.string().required(),
      specialty: joi.string().required(),
      availableSlots: joi.array().items(joi.object({
        start: joi.date().required(),
        end: joi.date().required()
      })).required()
    })
  },
  // Additional validators for updating provider info, availability, etc. can be added here
  updateProvider: {
    body: joi.object({
      userId: joi.string().optional(),
      specialty: joi.string().optional(),
      availableSlots: joi.array().items(joi.object({
        start: joi.date().required(),
        end: joi.date().required()
      })).optional()
    })
  },
  updateAvailability: {
    body: joi.object({
      slots: joi.array().items(joi.object({
        start: joi.date().required(),
        end: joi.date().required()
      })).required()
    })
  }
};
