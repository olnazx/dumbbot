'use strict';

/**
 * Module dependencies.
 * @private
 */
const fetch = require('../lib/fetch');
const apiKeysManager = require('../helpers/api-keys-manager');

/**
 * Local constants.
 * @private
 */
const API_ENDPOINT = 'http://api.openweathermap.org/data/2.5/';

/**
 * Returns "true", if provided date is tomorrow date.
 * @param {String} date Date String
 * @returns {Boolean}
 * @private
 */
const isItTomorrow = date => {
  const dateProvided = new Date(date);
  const dateTomorrow = new Date();

  // Set next-day date.
  dateTomorrow.setDate(dateTomorrow.getDate() + 1);

  // Compare dates.
  if (
    dateProvided.getDate() === dateTomorrow.getDate() &&
    dateProvided.getMonth() === dateTomorrow.getMonth() &&
    dateProvided.getFullYear() === dateTomorrow.getFullYear()
  ) {
    return true;
  }

  return false;
}

/**
 * Transforms weather Object of the response Object to text message.
 * @param {Object} object
 * @returns {String}
 * @private
 */
const weatherObjectToText = object => {
  const desc = object.weather[0].description;
  let temp = Math.round(object.main.temp);
      temp = temp > 0 ? `+${temp}` : temp;

  return `${temp} °C, ${desc}`;
}

/**
 * Transforms response Object to text message.
 * @param {Object} response Response Object
 * @param {String} date Tomorrow date (if present)
 * @returns {String}
 * @private
 */
const responseObjectToMessage = (response, date) => {
  let outputMessage = '';

  const cityName = response.city && response.city.name || response.name;
  const cityCountry = response.city && response.city.country || response.sys.country;
  const cityId = response.city && response.city.id || response.id;

  outputMessage += `${cityName}, ${cityCountry}\n`;
  outputMessage += `https://openweathermap.com/city/${cityId}\n\n`;

  if (response.list) {
    // 12:00 of tomorrow
    const tomorrowMidday = response.list.filter(item => item.dt_txt.startsWith(date))[4];

    outputMessage += 'Завтра будет ' + weatherObjectToText(tomorrowMidday);
  } else {
    outputMessage += 'Сейчас ' + weatherObjectToText(response);
  }

  return outputMessage;
}

/**
 * Weather action.
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

  if (!apiKeysManager.hasActiveKeys('weather')) {
    return message.reply('Запрос не был обработан. Попробуйте немного позже.');
  }

  /**
   * The city a weather is needed for.
   * @type {String}
   */
  const city = params['city'];

  /**
   * What to get: 5-day forecast or current weather.
   * @type {String}
   */
  const weatherTypeToGet = isItTomorrow(params['date']) ? 'forecast' : 'weather';

  return fetch(API_ENDPOINT + weatherTypeToGet, {
    qs: {
      appid: apiKeysManager.getCurrentKey('weather'),
      q: city,
      type: 'accurate',
      lang: 'ru',
      units: 'metric',

      // Count of "lines" to return (for forecast only)
      cnt: 16
    }
  })
    .then(response => response.json())
    .then(response => {
      /**
       * Response code.
       * @type {String/Number}
       */
      const code = response.cod || response.code;

      if (code != 200) {
        // The city is not found.
        if (code == 404) {
          return message.reply('Указанный город не найден.');
        }

        // Switch to the next API key for the future requests.
        apiKeysManager.switchToNextKey('weather');

        // Unknown error.
        return message.reply('Запрос не был обработан. Попробуйте немного позже.');
      }

      return message.reply(
        responseObjectToMessage(response, params.date)
      );
    });
}
