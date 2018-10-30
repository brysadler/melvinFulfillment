const moment = require('moment')
const utils = {
  capitalize: (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  },
  isTomorrow: (mDate) => {
    return this.isSameByDayAddDay(mDate, 1)
  },
  isSameByDayAddDay: (mDate, i) => {
    return mDate.isSame(moment().add(i, 'days'), 'days')
  },
  isToday: (mDate) => {
    return mDate.isSame(moment(), 'days')
  },
  randomize: (array) => {
    let randomizedIndex = Math.floor(Math.random() * array.length)
    return array[randomizedIndex]
  }
}

module.exports = utils
