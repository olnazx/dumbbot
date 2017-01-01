'use strict';

/**
 * A wrapper for "node-fetch" module
 * that adds some new features:
 *   1. Auto-retry on network errors;
 *   2. "qs" property for options object.
 */

/**
 * Module dependencies.
 * @private
 */
const fetch = require('node-fetch');

/**
 * Local constants.
 * @private
 */
const MAX_ATTEMPTS = 3;

/**
 * Wrapper.
 * @param {String} [url=''] URL
 * @param {Object} [options={}] Options
 * @param {Number} [_attempt=1] Attempt number
 * @returns {Promise}
 * @public
 */
function fetchWithAutoRetry (url = '', options = {}, _attempt = 1) {
  let urlWithQueryString = url;

  // Add querystring params to the URL.
  if (options.qs) {
    urlWithQueryString += '?';

    // We build query string manually (instead of using "querystring" module) 
    // to be sure that "falsy" (undefined, null, '') values will be excluded.
    for (let [key, value] of Object.entries(options.qs)) {
      if (value !== undefined && value !== null && value !== '') {
        urlWithQueryString += key + '=' + encodeURIComponent(value) + '&';
      }
    }

    urlWithQueryString = urlWithQueryString.slice(0, -1);
    options.qs = undefined;
  }

  return fetch(urlWithQueryString, options)
    .catch(error => {
      if (error.name === 'FetchError') {
        if (_attempt > MAX_ATTEMPTS) {
          throw error;
        } else {
          return fetchWithAutoRetry(url, options, ++_attempt);
        }
      }

      throw error;
    });
}

module.exports = fetchWithAutoRetry;
