'use strict';

/**
 * Once per a hour loads the fresh news from Meduza.io.
 * Then saves compiled news string to the Redis.
 */

/**
 * Module dependencies.
 * @private
 */
const XMLParser = require('fast-xml-parser');
const fetch = require('../lib/fetch');
const pino = require('../lib/pino');
const redis = require('../lib/redis');
const config = require('../config');

/**
 * Local constants.
 * @private
 */
const MEDUZA_RSS_ENDPOINT = 'https://meduza.io/rss/all';

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
  _moduleTimer = setTimeout(() => run(), config['module:meduza-news:refresh-rate']);
}

/**
 * Returns formatted time of publication.
 * @param {String} pubDate Full date of publication
 * @returns {String}
 * @private
 */
const getPublicationTime = pubDate => {
  const date = new Date(pubDate);
  const hoursAndMinutes = [date.getHours(), date.getMinutes()];

  return hoursAndMinutes
    .map(number => {
      if (number < 10) {
        return '0' + number;
      }

      return number;
    })
    .join(':');
}

/**
 * Runs the module function.
 * @returns {void}
 * @public
 */
const run = () => {
  fetch(MEDUZA_RSS_ENDPOINT)
    .then(response => response.text())
    .then(response => {
      let news = XMLParser.parse(response);

      // XML was not parsed correctly.
      if (!news) {
        throw new Error('RSS XML was not parsed correctly / response is empty.');
      }

      news = news.rss.channel.item;

      // No news or items were not parsed.
      if (!news || !Array.isArray(news) || !news.length) {
        throw new Error('There are no news / XML was not parsed correctly.');
      }

      // Build a string of news.
      news = news
        .slice(0, 5)
        .map(item => `${getPublicationTime(item.pubDate)} • ${item.title}`)
        .join('\n');

      // Save the news cache in the Redis storage.
      redis.call('SETEX', redis.keys['action:meduza-news:cache'], config['module:meduza-news:cache-expire-time'], news);

      // Update the module timer.
      setModuleTimer();
    })
    .catch(error => {
      pino.error('[modules/meduza-news.js]', error);

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
