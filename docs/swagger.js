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
  apis: ['../routes/*.js']
};

module.exports = swaggerJsdoc(options);

/*const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Contacts API',
    description: 'A simple CRUD API for managing contacts',
  },
  host: 'http://localhost:3000/',
  schemes: ['http'],
};
const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/*.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);*/