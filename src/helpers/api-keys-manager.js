'use strict';

/**
 * Module dependencies.
 * @private
 */
const pino = require('../lib/pino');
const config = require('../config');

/**
 * Available services.
 * @type {Object}
 */
const services = {
  'emotions': [config['action:emotions:api-keys'], 0],
  'lastfm': [config['action:lastfm:api-keys'], 0],
  'translate': [config['action:translate:api-keys'], 0],
  'weather': [config['action:weather:api-keys'], 0],

  'dialogflow': [config['library:dialogflow:access-tokens'], 0]
};

/**
 * Returns true, if there are active service API keys, 
 * that can be used in requests.
 * @param {String} service Service name
 * @returns {Boolean}
 * @public
 */
function hasActiveKeys (service) {
  const keys = services[service][0];

  return keys.length > 0;
}

/**
 * Returns service current API key.
 * @param {String} service Service name
 * @returns {String}
 * @public
 */
function getCurrentKey (service) {
  const keys = services[service][0];
  const index = services[service][1];

  return keys[index];
}

/**
 * Removes service current API key.
 * @param {String} service Service name
 * @returns {void}
 * @public
 */
function removeCurrentKey (service) {
  const keys = services[service][0];
  const index = services[service][1];

  keys.splice(index, 1);

  pino.fatal('[helpers/api-keys-manager.js] API key to be removed: %s[%i]', service, index);

  // Update current API key index.
  services[service][1] = 0;
}

/**
 * Switches to the next API key.
 * @param {String} service Service name
 * @returns {void}
 * @public
 */
function switchToNextKey (service) {
  const keys = services[service][0];

  services[service][1]++;

  if (services[service][1] === keys.length) {
    services[service][1] = 0;
  }
}

module.exports = {
  hasActiveKeys,
  getCurrentKey,
  removeCurrentKey,
  switchToNextKey
}
