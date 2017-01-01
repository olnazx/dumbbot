'use strict';

/**
 * A wrapper for "ioredis" module.
 */

/**
 * Module dependencies.
 * @private
 */
const Redis = require('ioredis');
const pino = require('./pino');

// Redis client.
const client = new Redis();

client.on('error', error => {
  if (error.code === 'ECONNREFUSED') {
    console.log('Redis Server is not running!');
    process.exit(0);
  }

  pino.error('[lib/redis.js]', error);
});

/**
 * Executes a Redis command.
 * @param {String} [command=''] Command name
 * @param {Any} params Parameters
 * @returns {Promise}
 * @public
 */
function call (command = '', ...params) {
  if (!command) {
    return Promise.reject(new Error('No command provided.'));
  }

  command = command.toLowerCase();

  // There is no such command.
  if (client[command] === undefined) {
    return Promise.reject(new Error('Unknown command.'));
  }

  return client[command](...params)
    .then(result => {
      if (
        command === 'hgetall' &&
        (!result || !Object.keys(result).length)
      ) {
        return null;
      }

      return result;
    })
    .catch(error => pino.error('[lib/redis.js:call]', error));
}

module.exports = {
  call,
  client,

  keys: require('../constants/redis-keys')
}
