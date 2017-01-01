'use strict';

/**
 * When action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = ({ answer }, message) => message.reply(answer);
