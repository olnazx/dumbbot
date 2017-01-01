'use strict';

/**
 * Module dependencies.
 * @private
 */
const fetch = require('../lib/fetch');

/**
 * Local constants.
 * @private
 */
const API_ENDPOINT = 'https://api.fixer.io/';

/**
 * Currency Rate action.
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
   * Date needed.
   * @type {String}
   */
  const date = params['date'] || 'latest';

  /**
   * Base currency.
   * @type {String}
   */
  let base = params['base'];

  /**
   * Target currencies.
   * @type {String}
   */
  const targets = (params['target'] || []).join(',');

  // Targets should not be equal to base currency.
  if (base === targets) {
    if (targets !== 'RUB') {
      base = 'RUB';
    } else {
      base = 'USD';
    }
  }

  return fetch(API_ENDPOINT + date, {
    qs: {
      base,
      symbols: targets
    }
  })
    .then(response => response.json())
    .then(response => {
      /**
       * Message to send to the user as an answer.
       * @type {String}
       */
      let messageText = '';

      if (date !== 'latest') {
        messageText += `Курсы валют на ${date}\n\n`;
      }

      for (let [currency, value] of Object.entries(response.rates)) {
        messageText += `1.00 ${response.base} → ${value.toFixed(2)} ${currency}\n`;
      }

      if (date === 'latest') {
        messageText += `\nПоследнее обновление курсов: ${response.date}`;
      }

      return message.reply(messageText);
    });
}
