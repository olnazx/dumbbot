'use strict';

/**
 * Module dependencies.
 * @private
 */
const fetch = require('../lib/fetch');
const apiKeysManager = require('../helpers/api-keys-manager');
const languages = require('../constants/languages');
const config = require('../config');

/**
 * Local constants.
 * @private
 */
const API_ENDPOINT = 'https://translate.yandex.net/api/v1.5/tr.json/translate';

/**
 * Translate action.
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

  if (!apiKeysManager.hasActiveKeys('translate')) {
    return message.reply('Запрос не был обработан. Попробуйте немного позже.');
  }

  /**
   * Text to translate.
   * @type {String}
   */
  const textToTranslate = params['text'];

  /**
   * Language to translate from.
   * @type {String}
   */
  const langFrom = params['lang-from'] || '';

  /**
   * Language to translate to.
   * @type {String}
   */
  const langTo = params['lang-to'];

  // Unsupported language to translate from.
  if (langFrom && languages['name-to-code'][langFrom] === undefined) {
    return message.reply('Перевод с данного языка невозможен.');
  }

  // Unsupported language to translate to.
  if (languages['name-to-code'][langTo] === undefined) {
    return message.reply('Перевод на данный язык невозможен.');
  }

  /**
   * Translate direction.
   * @type {String}
   *
   * https://tech.yandex.ru/translate/doc/dg/reference/translate-docpage/#param_lang
   */
  const translateDirection = langFrom ? `${languages['name-to-code'][langFrom]}-${languages['name-to-code'][langTo]}` : languages['name-to-code'][langTo];

  return fetch(API_ENDPOINT, {
    qs: {
      key: apiKeysManager.getCurrentKey('translate'),
      text: textToTranslate.slice(0, config['action:translate:text-max-length']),
      lang: translateDirection
    }
  })
    .then(response => response.json())
    .then(response => {
      /**
       * Response status code.
       * @type {Number}
       */
      const code = response.code;

      // API key is invalid or blocked.
      if (code === 401 || code === 402) {
        apiKeysManager.removeCurrentKey('translate');

        return module.exports({ params, isIncomplete, answer }, message);
      }

      // API key is exceeded.
      if (code === 404) {
        apiKeysManager.switchToNextKey('translate');

        return module.exports({ params, isIncomplete, answer }, message);
      }

      // The text can not be translated.
      if (code === 422) {
        return message.reply('Данный текст не может быть переведён.');
      }

      // Provided translate direction is unsupported.
      if (code === 501) {
        return message.reply('Заданное направление перевода не поддерживается.');
      }

      // No translated text received.
      if (!response.text || !response.text.length) {
        return;
      }

      /**
       * Translate direction used to translate the text.
       * @type {Array of String} [lang-from, lang-to]
       */
      const translatedDirection = response.lang && response.lang.split('-').map(langCode => languages['code-to-name'][langCode]) || [];

      return message.reply(
        '[ ' + translatedDirection.join(' → ') + ' ]\n\n' +
        textToTranslate + ' → ' + response.text.join(' ')
      );
    });
}
