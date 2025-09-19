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