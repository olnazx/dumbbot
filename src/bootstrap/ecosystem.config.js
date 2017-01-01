'use strict';

/**
 * Module dependencies.
 * @private
 */
const path = require('path');

const cwd = process.cwd();

module.exports = {
  apps: [
    {
      name: 'app',
      script: './src/app.js',
      env: { LOG_LEVEL: process.env.LOG_LEVEL },
      cwd,
      error_file: path.join(cwd, './logs/app-error.log'),
      out_file: path.join(cwd, './logs/app-out.log'),
      max_memory_restart: '350M'
    }
  ]
}
