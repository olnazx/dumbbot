'use strict';

/**
 * Module dependencies.
 * @private
 */
const pino = require('./lib/pino');
const MeduzaNewsModule = require('./modules/meduza-news');
const ReminderModule = require('./modules/reminder');

MeduzaNewsModule.init({ runOnInit: true });
ReminderModule.init({ runOnInit: true });

pino.info('All modules were initialized.');
