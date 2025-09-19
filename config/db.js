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