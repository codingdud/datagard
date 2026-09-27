const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const healthRouter = require('./routes/health.routes');
const apiRouter = require('./routes/api.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// --------------- Global Middleware ---------------
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// --------------- Routes ---------------
app.use('/health', healthRouter);
app.use('/api', apiRouter);

// --------------- Error Handling ---------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
