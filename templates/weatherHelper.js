timeOfDayArr = ['today', 'tomorrow', 'tonight', 'this morning', 'tomorrow morning', 'tomorrow night']

const helper = {
  dateTmpl : (date) => {
    return timeOfDayArr.indexOf(date.toLowerCase()) > -1 ? date : `on ${date.split(' ')[0]}`
  },
  numberPhraseTmpl : (obj) => {
    obj.number = Math.round(obj.number)
    return `${obj.number} ${pluralize(obj)}`
  },
  weatherDescTmpl : (weatherDesc) => {
    return skyToSkies(weatherDesc)
  },
  timeOfDayTmpl : (timeOfDay) => {
    let future = timeOfDay.includes('night') || timeOfDay.includes('morning')
      ? `${timeOfDay.split(' ')[0]} ${timeOfDay.split(' ')[1]}` : `${timeOfDay.split(' ')[0]}`
    return timeOfDayArr.indexOf(timeOfDay.toLowerCase()) > -1 ? timeOfDay : `On ${future}`
  },
  capitalizeFirst : (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  },
  skyToSkies: (weatherDesc) => {
    return weatherDesc.includes('sky') ? weatherDesc.replace(/sky/g, 'skies') : weatherDesc
  },
  skiesToSky: (weatherDesc) => {
    return weatherDesc.includes('skies') ? weatherDesc.replace(/skies/g, 'sky') : weatherDesc
  },
  sunnyToClear: (weatherDesc) => {
    return weatherDesc.includes('sunny') ? weatherDesc.replace(/sunny/g, 'clear sky') : weatherDesc
  },
  getDirection: (deg) => {
    switch (true) {
      case deg === 0:
      case deg === 360:
        return 'going north'
      case (deg > 0 && deg < 90):
        return 'going northeast'
      case deg === 90:
        return 'going east'
      case (deg > 90 && deg < 180):
        return 'going southeast'
      case deg === 180:
        return 'going south'
      case (deg > 180 && deg < 270):
        return 'going southwest'
      case deg === 270:
        return 'going west'
      case (deg > 270 && deg < 360):
        return 'going northwest'
      default:
        return ''
    }
  },
  pluralize: (obj) => {
    switch (obj.unit) {
      case 'mile':
        return obj.number === 1 ? 'mile' : 'miles'
      case 'inch':
        return obj.number === 1 ? 'inch' : 'inches'
    }
  },
  kelvinToFahrenheit: (kelvin) => {
    return Math.round((kelvin * (9 / 5)) - 459.67)
  }
}

module.exports = helper