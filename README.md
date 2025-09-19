# Appointment-Scheduling-System

A role-based appointment scheduling API built with Node.js, Express, MongoDB (Mongoose). Includes validation (Joi), centralized error handling, and Swagger docs.

## Quick start

1. Copy files into project structure.
2. `cp .env.example .env` and set `MONGO_URI` & `JWT_SECRET`.
3. `npm install`
4. `npm run dev`
5. Open `http://localhost:3000/api/docs`

## Notes

- Use Postman or Swagger UI to test endpoints.
- Add production-grade logging and rate-limiting for real deployments.
- Consider MongoDB transactions for multi-document operations.