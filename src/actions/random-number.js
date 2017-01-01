'use strict';

/**
 * Random Number action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = ({ params }, message) => {
  /**
   * Start of range.
   * @type {Number}
   */
  const from = parseInt(params['number-from']);

  /**
   * End of range.
   * @type {Number}
   */
  const to = parseInt(params['number-to']);

  /**
   * Random number in specified range.
   * @type {Number}
   */
  const randomNumber = Math.floor(from + Math.random() * (to + 1 - from));

  return message.reply(`🎲 Число — ${randomNumber}`);
}
