'use strict';

/**
 * Unsplash action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = (_, message) => message.replyWithPhoto('https://source.unsplash.com/random/800x600');
