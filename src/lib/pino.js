'use strict';

/**
 * Module dependencies.
 * @private
 */
const pino = require('pino');

// Pino logger instance.
const logger = pino();

// Set a log level.
logger.level = process.env.LOG_LEVEL || 'error';

module.exports = logger;
