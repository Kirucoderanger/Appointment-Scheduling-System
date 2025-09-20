const { token } = require('morgan');
const { base } = require('./models/User');

const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Appointment Scheduling System API',
    description: 'A simple CRUD API for managing appointments',
    testToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
  },
  host: 'appointment-scheduling-system-nbsu.onrender.com',
  schemes: ['https'],
};
const outputFile = './swagger-output.json';
const endpointsFiles = [ './server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
