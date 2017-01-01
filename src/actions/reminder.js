'use strict';

/**
 * Module dependencies.
 * @private
 */
const differenceInDays = require('date-fns/difference_in_days')
const formatDate = require('date-fns/format');
const redis = require('../lib/redis');

/**
 * Parses "date-time" param into timestamp.
 * @param {String} dateTime Date-time param
 * @returns {Number}
 * @private
 */
const parseDateTime = dateTime => {
  // "date-time" is a date period. Example: 2017-10-15T16:00:00Z/2017-10-15T23:59:00Z
  // Return a timestamp of the first date.
  if (dateTime.includes('/')) {
    let date = new Date(dateTime.split('/')[0]);

    if (date.endsWith('Z')) {
      date = date.slice(0, -1);
    }

    return date.getTime();
  }

  // "date-time" is a date. Example: 2017-10-15
  if (!dateTime.includes(':')) {
    return (new Date(dateTime)).getTime();
  }

  // "date-time" is a time. Example: 12:44:22
  return (new Date(`${formatDate(Date.now(), 'YYYY-MM-DD')}T${dateTime}`)).getTime();
}

/**
 * Reminder action.
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
   * Provided date-time timestamp.
   * @type {Number}
   */
  const dateTime = parseDateTime(params['date-time']);

  /**
   * What does bot need to remind.
   * @type {String}
   */
  const whatToRemind = params['text'];

  /**
   * Nonce timestamp.
   * @type {Number}
   */
  const dateNow = Date.now();

  // Date from past.
  if (dateTime < dateNow) {
    return message.reply('Как я могу напомнить о событии из прошлого? :)');
  }

  // More than 7 full days from now to date needed.
  if (differenceInDays(dateTime, dateNow) > 7) {
    return message.reply('Установить напоминание позже, чем на неделю вперёд, не получится.');
  }

  /**
   * Reminder Object that will be saved in the Redis.
   * @type {Object}
   */
  const reminder = {
    what: whatToRemind,
    whom: message.user_id
  }

  return redis.call('ZADD', redis.keys['action:reminder:list'], dateTime, JSON.stringify(reminder))
    .then(result => {
      // Redis error.
      if (result === undefined) {
        return message.reply('Запрос не был обработан. Попробуйте немного позже.');
      }

      return message.reply('Напоминание сохранено. Если не забуду, обязательно напомню. 😂\n\nP.S. Время напоминаний — московское.');
    });
}
