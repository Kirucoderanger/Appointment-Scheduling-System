module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const payload = {
    message: err.message || 'Internal Server Error'
  };
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
};