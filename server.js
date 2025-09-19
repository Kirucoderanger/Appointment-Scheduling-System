const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDb = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// connect database
connectDb(process.env.MONGO_URI);

// middlewares
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/providers', require('./routes/providers'));

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// error handler (last)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));