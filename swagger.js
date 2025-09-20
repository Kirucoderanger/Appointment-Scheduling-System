const { base } = require('./models/User');

const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Appointment Scheduling System API',
    description: 'A simple CRUD API for managing appointments',
  },
  host: 'appointment-scheduling-system-nbsu.onrender.com',
  schemes: ['https'],
};
const outputFile = './swagger-output.json';
const endpointsFiles = [ './server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
