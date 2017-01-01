'use strict';

/**
 * Module dependencies.
 * @private
 */
const { URLSearchParams } = require('url');
const xml2js = require('xml2js');
const fetch = require('./fetch');
const config = require('../config');

/**
 * Local constants.
 * @private
 */
const REQUEST_URL = 'http://cleverbot.existor.com/webservicexml';
const RUSSIAN_LANG_REGEXP = /[а-яё]/ig;

/**
 * Парсит ответ Cleverbot.
 * @param {String} response XML-документ
 * @returns {Promise}
 * @private
 */
async function parseResponse (response) {
  if (!response || !response.length) {
    return;
  }

  return new Promise((resolve, reject) => {
    xml2js.parseString(response, (err, result) => {
      if (err) {
        // Не возвращаем и не логгируем ошибки парсера.
        return resolve();
      }

      /**
       * Response text.
       * @type {String}
       */
      let body = result.webservicexml.session[0].response[0];

      // Bad answer or no answer at all.
      if (!body || !RUSSIAN_LANG_REGEXP.test(body) || /(?:botlike|clever|real person)/.test(body.toLowerCase())) {
        return resolve();
      }

      // Delete trailing dots.
      if (body.endsWith('.')) {
        body = body.slice(0, -1);
      }

      resolve(body);
    });
  });
}

/**
 * Получает ответ на сообщение.
 * @param {String} messageText Текст сообщения
 * @returns {Promise}
 * @public
 */
async function send (messageText) {
  if (!messageText) {
    return;
  }

  return fetch(REQUEST_URL, {
      method: 'POST',
      body: new URLSearchParams({
        icognoID: config['library:cleverbot:username'],
        icognoCheck: config['library:cleverbot:password'],
        isLearning: '0',
        stimulus: messageText
      })
    })
    .then(response => response.text())
    .then(response => parseResponse(response));
}

module.exports = {
  send
}
