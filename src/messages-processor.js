'use strict';

/**
 * Module dependencies.
 * @private
 */
const fs = require('fs');
const path = require('path');
const pino = require('./lib/pino');
const Dialogflow = require('./lib/dialogflow');

/**
 * Local constants.
 * @private
 */
const HTML_ENTITIES = [[/&lt;/g, '<'], [/&gt;/g, '>'], [/&amp;/g, '&'], [/&quot;/g, '"'], [/<br>/g, ' ']];

/**
 * Local variables.
 * @private
 */
const actions = Object.create(null);

// Include all actions.
fs.readdirSync(path.join(__dirname, './actions'))
  .filter(filename => filename.endsWith('.js'))
  .map(filename => filename.slice(0, -3))
  .forEach(action => { actions[action] = require('./actions/' + action); });

pino.info('Actions loaded.');

/**
 * Parses text of the message.
 * @param {Object} message Message Object
 * @returns {String/null} Message text or null, if no message parsed
 * @private
 */
function parseMessageText (message) {
  /**
   * Text of the message received.
   * @type {String}
   */
  let messageText = message.body;

  // No message text provided.
  // Trying to get a text of the forwarded message.
  if (!messageText) {
    /**
     * Array of forwarded messages.
     * @type {Array of ForwardedMessage}
     *
     * ForwardedMessage
     *   {
     *     user_id<Number>,
     *     date<Number>,
     *     body<String>,
     *     ?attachments<Array>,
     *     ?fwd_messages<Array>,
     *     ?...
     *   }
     */
    const fwdMessages = message.fwd_messages;

    // There are no forwarded messages at all or
    // more than one message forwarded.
    if (!fwdMessages || fwdMessages.length > 1) {
      return null;
    }

    /**
     * The text of the message forwarded.
     * @type {String}
     */
    const fwdMessageBody = fwdMessages[0] && fwdMessages[0].body;

    // The forwarded message does not contain any text.
    if (!fwdMessageBody) {
      return null;
    }

    messageText = fwdMessageBody;
  }

  // Replace HTML entities.
  if (messageText.length >= 4) {
    for (let [replaceWhat, replaceWith] of HTML_ENTITIES) {
      messageText = messageText.replace(replaceWhat, replaceWith);
    }
  }

  return messageText;
}

/**
 * Processes incoming messages from VK Callback API.
 * @param {Object} message Message Object
 * @returns {void}
 * @public
 */
function messagesProcessor (message) {
  pino.info('A new message received.');

  /**
   * Text of the message received.
   * @type {String}
   */
  const messageText = parseMessageText(message);

  // No message received.
  if (!messageText) {
    return;
  }

  /**
   * Unique Session ID.
   * @type {String}
   */
  const sid = `uid${message.user_id}`;

  // Make a request to api.ai service to
  // explore message received from a user.
  Dialogflow.query(messageText, { sid })
    .then(response => {
      // No response received.
      if (!response) {
        return;
      }

      /**
       * "result" property of "/query" endpoint response object.
       * @type {Object}
       *
       * https://api.ai/docs/reference/agent/query
       */
      const result = response.result;

      // Action is undefined or there is no handler for this action.
      if (!result.action || !actions[result.action]) {
        return;
      }

      pino.info('Processing the "%s" action.', result.action);

      // Call an action handler.
      //
      // ** Actions should return a Promise.
      actions[result.action]({
        intent: result.metadata.intentName,
        params: result.parameters,
        isIncomplete: !!result.actionIncomplete,
        answer: result.fulfillment && result.fulfillment.speech || result.speech || ''
      }, message)
        .catch(error => pino.error('Error in action "%s".', result.action, error));
    });
}

module.exports = messagesProcessor;
