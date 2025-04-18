const moment = require('moment');

function getDateTimeMoment(date, time) {
  return moment(`${date} ${time}`, 'YYYY-MM-DD hh:mm a');
}

module.exports = { getDateTimeMoment };
