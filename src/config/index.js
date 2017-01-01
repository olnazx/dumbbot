'use strict';

/**
 * Application config.
 */

module.exports = {
  /**
   * Microsoft Emotions free API keys.
   * @type {String}
   */
  'action:emotions:api-keys': [
    '<api_key>'
  ],

  /**
   * Last.fm free API keys.
   * @type {String}
   */
  'action:lastfm:api-keys': [
    '<api_key>',
    '<api_key>',
    '<api_key>',
    '<api_key>'
  ],

  /**
   * Maximum length of the artist bio text.
   * @type {Number}
   */
  'action:lastfm:text-max-length': 1024,

  /**
   * Yandex.Translate free API keys.
   * @type {String}
   * 
   * https://translate.yandex.ru/developers/keys
   */
  'action:translate:api-keys': [
    '<api_key>',
    '<api_key>',
    '<api_key>',
    '<api_key>'
  ],

  /**
   * Maximum length of the text to translate.
   * @type {Number}
   */
  'action:translate:text-max-length': 240,

  /**
   * Openweathermap.com free API keys.
   * @type {String}
   */
  'action:weather:api-keys': [
    '<api_key>'
  ],

  /**
   * Cleverbot password.
   * @type {String}
   */
  'library:cleverbot:password': '<password>',

  /**
   * Cleverbot username.
   * @type {String}
   */
  'library:cleverbot:username': '<username>',

  /**
   * Dialogflow Access Tokens.
   * @type {String}
   */
  'library:dialogflow:access-tokens': [
    '<access_token>'
  ],
  
  /**
   * Vkontakte Community Access Token.
   * @type {String}
   */
  'vkcom:access-token': '<access_token>',

  /**
   * Vkontakte Community Confirmation Code.
   * @type {String}
   */
  'vkcom:confirmation-code': '<confirmation_code>',

  /**
   * Vkontakte Community ID.
   * @type {Number}
   */
  'vkcom:id': '<community_id>',

  /**
   * Vkontakte Community Secret Key.
   * @type {String}
   */
  'vkcom:secret-key': '<secret_key>',

  /**
   * Refresh Meduza.io news every N milliseconds.
   * @type {Number} milliseconds
   */
  'module:meduza-news:refresh-rate': 60 * 60 * 1000,

  /**
   * Time of cache expiration in seconds.
   * @type {Number} seconds
   */
  'module:meduza-news:cache-expire-time': 12 * 60 * 60,

  /**
   * Check reminders evey N milliseconds.
   * @type {Number}
   */
  'module:reminder:check-rate': 60 * 1000
}
