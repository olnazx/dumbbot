'use strict';

/**
 * Transforms text to speech.
 * 
 * Yandex Speech Kit is used.
 * Docs: https://tech.yandex.ru/speechkit/cloud/doc/guide/concepts/tts-http-request-docpage/
 * 
 * As an alternative Google TTS can be used.
 * Free version: https://github.com/zlargon/google-tts
 */

/**
 * Module dependencies.
 * @private
 */
const fetch = require('../lib/fetch');

/**
 * Local constants.
 * @private
 */
const API_ENDPOINT = 'https://tts.voicetech.yandex.net/tts';

/**
 * Text to Speech action.
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

  /**
   * Text to speech.
   * @type {String}
   */
  const text = params['text'];

  /**
   * TTS emotion.
   * @type {String}
   */
  const emotion = params['emotion'];

  /**
   * TTS speaker.
   * @type {String}
   */
  const speaker = params['speaker'];

  /**
   * TTS speed.
   * @type {Number}
   */
  const speed = params['speed'];

  return fetch(API_ENDPOINT, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36'
    },

    qs: {
      speaker,
      emotion,
      speed,
      text,
      lang: 'ru_RU',
      format: 'mp3',
      quality: 'hi',
      platform: 'web',
      application: 'translate'
    }
  })
    .then(audio => audio.buffer())
    .then(buffer => message.client.upload('document', { content: buffer, name: 'audio.mp3' }, { type: 'audio_message', peer_id: message.user_id }))
    .then(response => message.reply({ attachment: `doc${response[0].owner_id}_${response[0].id}` }));
}
