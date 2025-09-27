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
  }
};
