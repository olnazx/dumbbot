'use strict';

/**
 * Chance action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = ({ isIncomplete, answer }, message) => {
  if (isIncomplete) {
    return message.reply(answer);
  }

  /**
   * Probability — random number in range 0..100.
   * @type {Number}
   */
  const probability = Math.floor(Math.random() * 101);

  return message.reply(`🤔 Вероятность — ${probability}%`);
}
