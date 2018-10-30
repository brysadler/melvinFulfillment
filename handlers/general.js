const moment = require('moment')
const config = require('../config').handler.general
const template = require('../templates/general')
const TIME_FORMAT = config.timeFormat
const DATE_FORMAT = config.dateFormat

exports.execute = (method, parameters) => {
  switch(method) {
    case 'time':
      return Promise.resolve(time(method, parameters))
    case 'date':
      return Promise.resolve(date(method, parameters))
    case 'googleSearch':
      return googleSearch(method, parameters)
    default:
      return Promise.resolve(template.default)
  }
}

function time (method, parameters) {
  let time = moment().format(TIME_FORMAT)
  switch (true) {
    case parameters.state === 'polar':
      return checkTime(method, parameters)
    default:
      return template[method].time(time)
  }
}

function checkTime (method, parameters) {
  let time = parameters.time
  let ans = false
  let now = moment()
  switch (true) {
    case moment(time).isSame(now, 'minutes'):
      ans = true
      return template[method].isTime(moment(time).format(TIME_FORMAT))
    default:
      return checkDiff(time, now, method)
  }
}

function checkDiff (time, now, method) {
  let diff = now.diff(time)
  return template[method].timeDifference(time.format(TIME_FORMAT), (diff/1000)/60)
}

function date (method, parameters) {
  let now = moment()
  let Date = parameters.date === 'today' ? now : moment(parameters.date)

  if (now.isSame(Date, 'days')) {
    return template[method].today(Date.format(DATE_FORMAT))
  } else if (Date.isBefore(now)) {
    return template[method].past(Date.format(DATE_FORMAT))
  } else {
    return template[method].future(Date.format(DATE_FORMAT))
  }
}

function googleSearch (method, parameters) {

}