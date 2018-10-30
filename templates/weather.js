const weatherHelper = require('./weatherHelper')
const template = {
  default: `Hmm, the meteorologists aren't speaking to me right now. Please try again later.`,
  invalidDate: `I'm sorry I couldn't understand the date you asked for, please try again.`,
  forecast: {
    fiveDay: (forecast, city) => {
      let message = `Here's the weather in ${city} for the next ${forecast.length} days.\n`
      for (let i = 0; i < forecast.length; i++) {
        message += `${forecast[i].date.split(' ')[0]}, ${forecast[i].weatherDesc} with a high of ${forecast[i].high} and a low of ${forecast[i].low}.\n`
      }
      return message
    },
    fiveDayPolar: (forecast, city) => {
      if (forecast.ans === 'Yes') {
        let date = weatherHelper.dateTmpl(forecast.date)
        let weatherDesc = weatherHelper.weatherDescTmpl(forecast.weatherDesc)
        return `${forecast.ans}, it looks like we will see ${weatherObj.weatherDesc} in ${city} ${weatherObj.date}.`
      } else {
        return `${forecast.ans}, we are not predicted to see any ${forecast.state} within the next week.`
      }
    },
    state: (state) => {
      return `I can only give information on specific cities. Please ask me about the weather in a city in ${state}`
    },
    today: (city, w, timeOfDay) => {
      timeOfDay = weatherHelper.capitalizeFirst(timeOfDay)
      return `It is currently ${w.current} degrees in ${city}. ${timeOfDay} you can expect a high of ${w.high} and a low of ${w.low} with ${w.forecast}.`
    },
    todaySpecific: (city, w, timeOfDay, params) => {
      switch (params.weather) {
        case 'windy':
        case 'wind':
          return `The current wind speed in ${city} is ${Math.round(parseFloat(w.wind.speed))} miles per hour ${w.wind.direction}.`
        case 'snow':
        case 'snowy':
          return w.snow === '0' ? `Currently there is no snow on the ground in ${city}.`
            : `Currently there is about ${w.snow} inches of snow on the ground in ${city}.`
        case 'rain':
        case 'rainy':
          return w.rain === '0' ? `Currently there is no rain on the ground in ${city}.`
            : `Currently there is about ${w.rain} inches of rain on the ground in ${city}.`
      }
    },
    futureSpecific: (city, w, timeOfDay, params) => {
      timeOfDay = weatherHelper.capitalizeFirst(timeOfDay)
      switch (params.weather) {
        case 'windy':
        case 'wind':
          let windSpeed = weatherHelper.numberPhraseTmpl({number: w.wind.speed, unit: `mile`})
          timeOfDay = weatherHelper.timeOfDayTmpl(timeOfDay)
          return `${timeOfDay} the wind speed in ${city} will be ${windSpeed} per hour ${w.wind.direction}.`
        case 'snow':
        case 'snowy':
          let snow = weatherHelper.numberPhraseTmpl({number: w.snow, unit: `inch`})
          timeOfDay = weatherHelper.timeOfDayTmpl(timeOfDay)
          return w.snow === '0' ? `${timeOfDay} there will be no snow on the ground in ${city}.`
            : `${timeOfDay} there will be about ${snow} of snow on the ground in ${city}.`
        case 'rain':
        case 'rainy':
          let rain = weatherHelper.numberPhraseTmpl({number: w.rain, unit: `inch`})
          timeOfDay = weatherHelper.timeOfDayTmpl(timeOfDay)
          return w.rain === '0' ? `${timeOfDay} there will be no rain on the ground in ${city}.`
            : `${timeOfDay} there will be about ${rain} of rain on the ground in ${city}.`
      }
    },
    future: (city, date, w) => {
      return `In ${city} for ${date} there will be a high of ${w.high} and a low of ${w.low} with ${w.forecast}.`
    },
    Polar: {
      today: (obj, timeOfDay) => {
        let weatherDesc = weatherHelper.weatherDescTmpl(obj.weatherDesc)
        timeOfDay = weatherHelper.timeOfDayTmpl(timeOfDay)
        return `${obj.ans}, it looks like there will be ${weatherDesc} ${timeOfDay}.`
      },
      future: (obj, date) => {
        date = weatherHelper.dateTmpl(date)
        let weatherDesc = weatherHelper.weatherDescTmpl(obj.weatherDesc)
        return `${obj.ans}, it looks like there will be ${weatherDesc} ${date}.`
      }
    },
    weekend: {
      forecast: (weekendForecast, parameters) => {
        return `Here's the forecast for this weekend in ${parameters['geo-city']}. Saturday ${weekendForecast.saturday.current} with 
        ${weekendForecast.saturday.forecast} and Sunday ${weekendForecast.sunday.current} with 
        ${weekendForecast.sunday.forecast}.`
      },
      polar: (weekendForecast, parameters) => {
        if (weekendForecast.weekend.ans === 'Yes') {
          return `Yes, it looks like we will see ${parameters.weather} in ${parameters['geo-city']} 
          this weekend.`
        } else {
          return `No, we are not predicted to see any ${parameters.weather} this weekend.`
        }
      }
    },
    limit: `I can only see the weather up to five days in the future.`,
    past: `I am unable to look into past weather. We all have our flaws.`
  }
}

module.exports = template