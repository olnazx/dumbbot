'use strict';

/**
 * Module dependencies.
 * @private
 */
const cleverbot = require('../lib/cleverbot');

/**
 * Fallback action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = ({ answer }, message) => {
  return cleverbot.send(message.body.slice(0, 250))
    .then(response => {
      if (!response) {
        response = answer;
      }

      return message.reply(response);
    })
    .catch(error => message.reply(answer));
}
