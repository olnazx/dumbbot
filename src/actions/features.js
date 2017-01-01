'use strict';

/**
 * Features action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = (_, message) => message.reply(
  'Описание всех моих функций можно найти здесь:\nhttps://github.com/olnazx/dumbbot'
);
