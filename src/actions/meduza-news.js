'use strict';

/**
 * Module dependencies.
 * @private
 */
const redis = require('../lib/redis');

/**
 * Meduza News action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = (_, message) => {
  return redis
    .call('GET', redis.keys['action:meduza-news:cache'])
    .then(newsString => {
      // No news or Redis error.
      if (newsString === null || newsString === undefined) {
        return message.reply('Пока нет новостей. Приходите попозже.');
      }

      let newsStringToSend = 'Актуальные новости ↴';

      newsStringToSend += `\n\n${newsString}\n\n`;
      newsStringToSend += 'Эти и другие новости читайте на сайте meduza.io.';

      return message.reply(newsStringToSend);
    });
}
