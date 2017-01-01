'use strict';

/**
 * A tiny client for Dialogflow.com.
 */

/**
 * Module dependencies.
 * @private
 */
const fetch = require('./fetch');
const pino = require('./pino');
const apiKeysManager = require('../helpers/api-keys-manager');

/**
 * Local constants.
 * @private
 */
const API_ENDPOINT = 'https://api.dialogflow.com/v1';
const API_LANG = 'ru';
const API_VERSION  = '20150910';

/**
 * Makes a request to the "/query" endpoint.
 * @param {String} text Query
 * @param {Object} params Request parameters
 *   @property {String} sid Session ID
 * @returns {Promise}
 * @private
 */
function query (text, { sid } = {}) {
  return fetch(API_ENDPOINT + '/query', {
    body: JSON.stringify({
      // Max length allowed is 256 characters
      // https://api.ai/docs/reference/agent/query
      query: text.slice(0, 256),
      sessionId: sid,
      lang: API_LANG
    }),
    headers: {
      'Authorization': `Bearer ${apiKeysManager.getCurrentKey('dialogflow')}`,
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'POST',
    timeout: 5000,
    qs: {
      v: API_VERSION
    }
  })
  .then(response => response.json())
  .then(response => {
    /**
     * Response status code.
     * @type {Number}
     */
    const status = response.status;

    // All error codes can be found here:
    // https://api.ai/docs/reference/agent/#status_and_error_codes
    if (status.code !== 200) {
      // Too many requests made.
      // Requests quota: https://console.api.ai/api-client/profile
      if (status.code === 429) {
        apiKeysManager.switchToNextKey('dialogflow');

        // return query(text, { sid });
      }

      // Throw an error down to "catch" block.
      throw new Error(`${status.code} — ${status.errorType}${status.errorDetails ? (': ' + status.errorDetails) : ''}`);
    }

    return response;
  })
  .catch(error => pino.error('[lib/dialogflow.js]', error));

}

module.exports = {
  query
}
