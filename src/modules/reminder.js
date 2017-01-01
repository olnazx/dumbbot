'use strict';

/**
 * Checks for stored keys every minute.
 * Sends messages if necessary.
 */

/**
 * Module dependencies.
 * @private
 */
const redis = require('../lib/redis');
const app = require('../app');
const config = require('../config');

/**
 * Local variables.
 * @private
 */
let _moduleTimer;

/**
 * Sets module timer.
 * @returns {void}
 * @private
 */
const setModuleTimer = () => {
  _moduleTimer = setTimeout(() => run(), config['module:reminder:check-rate']);
}

/**
 * Parses string to JSON.
 * @param {String} jsonStr
 * @returns {Any}
 * @private
 */
const parseJson = jsonStr => {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

/**
 * Runs the module function.
 * @returns {void}
 * @public
 */
const run = () => {
  /**
   * Max. timestamp of a reminder to include in the result.
   * @type {Number}
   */
  const maxScore = Date.now();

  redis.call('ZRANGEBYSCORE', redis.keys['action:reminder:list'], 0, maxScore)
    .then(results => {
      if (results === undefined) {
        return setModuleTimer();
      }

      for (let result of results) {
        /**
         * Reminder Object.
         * @type {Object}
         *
         * Ref.: actions/reminder.js
         */
        const reminder = parseJson(result);

        if (!reminder) {
          continue;
        }

        app.client.call('messages.send', {
          user_id: reminder.whom, 
          message: `Напоминание: «${reminder.what}».`
        });
      }

      // Remove elements were processed.
      redis.call('ZREMRANGEBYSCORE', redis.keys['action:reminder:list'], 0, maxScore);

      setModuleTimer();
    });
}

/**
 * Initializes the module.
 * @param {Object} [options={}]
 *   @property {Boolean} runOnInit Forces a module run on init, if true
 * @returns {void}
 * @public
 *
 * Init function is called only once - at the application start.
 */
const init = ({ runOnInit } = {}) => {
  if (runOnInit) {
    return run();
  }

  setModuleTimer();
}

module.exports = {
  init,
  run
}
