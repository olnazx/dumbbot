'use strict';

/**
 * Module dependencies.
 * @private
 */
const fetch = require('../lib/fetch');
const apiKeysManager = require('../helpers/api-keys-manager');
const config = require('../config');

/**
 * Local constants.
 * @private
 */
const API_ENDPOINT = 'http://ws.audioscrobbler.com/2.0/';

/**
 * Lastfm action.
 * @param {Object}
 *   @property {Object} params
 *   @property {Boolean} isIncomplete
 *   @property {String} answer
 *   @property {String} intent
 * @param {Object} message
 * @returns {Promise}
 * @public
 */
module.exports = ({ params, isIncomplete, answer }, message) => {
  if (isIncomplete) {
    return message.reply(answer);
  }

  if (!apiKeysManager.hasActiveKeys('lastfm')) {
    return message.reply('Запрос не был обработан. Попробуйте немного позже.');
  }

  /**
   * The name of an artist.
   * @type {String}
   */
  const artistName = params.artist;

  return fetch(API_ENDPOINT, {
    qs: {
      api_key: apiKeysManager.getCurrentKey('lastfm'),
      method: 'artist.getinfo',
      format: 'json',
      lang: 'ru',
      autocorrect: '1',
      artist: artistName
    }
  })
    .then(response => response.json())
    .then(response => {
      /**
       * Artist Object.
       * @type {Object}
       *
       * https://www.last.fm/api/show/artist.getInfo
       */
      const artist = response.artist;

      // Artist info was not gathered.
      if (response.error || !artist) {
        const code = response.error;

        // The artist is not found.
        if (code === 6) {
          return message.reply('Указанный исполнитель не найден.');
        }

        // Unable to process the request now.
        if (code === 7 || code === 8 || code === 11 || code === 16) {
          return message.reply('Запрос не был обработан. Попробуйте немного позже.');
        }

        // Rate limit exceeded.
        if (code === 29) {
          apiKeysManager.switchToNextKey('lastfm');

          return module.exports({ params, isIncomplete, answer }, message);
        }

        // API-key is suspended.
        if (code === 26) {
          apiKeysManager.removeCurrentKey('lastfm');

          return module.exports({ params, isIncomplete, answer }, message);
        }

        // Unknown error.
        return message.reply('Запрос не был обработан. Попробуйте немного позже.');
      }

      /**
       * The text to send to the user.
       * @type {String}
       */
      let responseText = `${artist.name}\n${artist.url}\n\n`;

      // Parse stats.
      if (artist.stats) {
        responseText += `Слушателей / прослушиваний: ${artist.stats.listeners} / ${artist.stats.playcount}\n\n`;
      }

      // Parse artist bio content.
      if (artist.bio && artist.bio.content) {
        let artistBioText = artist.bio.content.replace(/\s+?<a .*?>Read more on Last\.fm<\/a>.*$/, '');

        if (artistBioText.length > config['action:lastfm:text-max-length']) {
          artistBioText = artistBioText.slice(0, config['action:lastfm:text-max-length']) + ' <...>';
        }

        responseText += artistBioText;
      }

      /**
       * Array of Artist images.
       * @type {Array of Object}
       */
      let artistImage = artist.image;

      if (!artistImage || !artistImage.length) {
        return message.reply(responseText);
      }

      artistImage = artistImage[artistImage.length - 1]['#text'];

      return fetch(artistImage)
        .then(image => image.buffer())
        .then(buffer => message.client.upload('photo', { content: buffer, name: 'image.jpg' }))
        .then(response => message.reply({
          message: responseText,
          attachment: `photo${response[0].owner_id}_${response[0].id}`
        }));
    });
}
