'use strict';

/**
 * Module dependencies.
 * @private
 */
const spotty = require('spotted')();
const config = require('./config');

module.exports = spotty;

spotty.setCommunity({
  accessToken: config['vkcom:access-token'],
  confirmationCode: config['vkcom:confirmation-code'],
  secretKey: config['vkcom:secret-key']
});

spotty.on('message_new', require('./messages-processor'));

spotty.run();

require('./modules-initializer');
