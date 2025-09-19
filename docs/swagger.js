// docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Appointment Scheduler API',
      version: '1.0.0',
      description: 'API documentation for Appointment Scheduling System'
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Local server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c45d6e7f89012345' },
            name: { type: 'string', example: 'Alice Johnson' },
            email: { type: 'string', example: 'alice@example.com' },
            role: { type: 'string', enum: ['client', 'provider', 'admin'], example: 'client' }
          }
        },
        Provider: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c45d6e7f89056789' },
            userId: { $ref: '#/components/schemas/User' },
            specialty: { type: 'string', example: 'Dermatologist' },
            availableSlots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  start: { type: 'string', format: 'date-time', example: '2025-09-18T09:00:00Z' },
                  end: { type: 'string', format: 'date-time', example: '2025-09-18T09:30:00Z' }
                }
              }
            }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c45d6e7f89098765' },
            clientId: { $ref: '#/components/schemas/User' },
            providerId: { $ref: '#/components/schemas/Provider' },
            start: { type: 'string', format: 'date-time', example: '2025-09-18T09:00:00Z' },
            end: { type: 'string', format: 'date-time', example: '2025-09-18T09:30:00Z' },
            status: { type: 'string', enum: ['scheduled', 'cancelled', 'completed'], example: 'scheduled' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Invalid credentials' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // keep your route annotations here
};

module.exports = swaggerJSDoc(options);






/*const swaggerJsdoc = require('swagger-jsdoc');

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

module.exports = swaggerJsdoc(options);*/

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