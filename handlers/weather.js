const moment = require('moment-timezone').tz.setDefault('America/New_York')
const w2n = require('words-to-num')
const weatherHelper = require('../templates/weatherHelper')

exports.execute = (method, parameters) => {
  switch (method) {
    case 'forecast':
      return forecast(method, parameters)
    case 'fetchWeather':
      return fetchWeather(method, parameters)
    default:
      return template.default()
  }
}

function forecast (method, parameters) {
  console.log('forecast')
  if (parameters['geo-state-us']) return sendResponse(template[method].state(parameters['geo-state-us']))
  let city = parameters['geo-city']
  let date = parameters['date']
  let mDate
  let today = (date === 'today' || moment(date).isSame(moment(), 'days')) || false
  let response
  if (!today) {
    mDate = moment(date)
    if (!moment(mDate).isValid()) {
      console.log(`weather:forecast:date:invalid`, { parameters, agentId: parameters.agentId, uuid: parameters.uuid })
      response = template.invalidDate
      return sendResponse(response)
    } else {
      if (moment().add(6, 'days').isSameOrBefore(mDate, 'days')) {
        response = template[method].limit
        return sendResponse(response)
      }
      if (mDate.isBefore(moment(), 'days')) {
        response = template[method].past
        return sendResponse(response)
      }
    }
  }

  return fetchWeather(city)
    .then((json) => {
      console.log('fetchWeather before utc editing: ', json.list.length)
      json.list = UTCToEastern(json.list)
      console.log('fetchWeather after utc editing: ', json.list.length)
      if (parameters.numberDay) {
        response = handleNumberDayForecast(parameters, json, city, method)
        return sendResponse(response)
      } else if (parameters.time && parameters.time === 'next week'|| parameters.time === 'this week') {                  // = 5 day forecast (sometimes polar)
        response = handleFiveDayForecast(parameters, json, city, date, method)
        return sendResponse(response)
      } else if (parameters.time && (parameters.time === 'this weekend')) {
        response = handleWeekendQueries(parameters, json, method)
        return sendResponse(response)
      } else {
        response = handleWeatherTodayOrFuture(parameters, json, today, city, mDate, method)
        console.log('got response')
        return sendResponse(response)
      }
    })
    .catch((error) => {
      console.log('weather:forecast:error', error, { parameters, agentId: parameters.agentId, uuid: parameters.uuid })
      return sendResponse(template.default)
    })
}

function UTCToEastern (forecastList) {
  for (let i = 0; i < forecastList.length; i++) {
    forecastList[i].mDt_txt = moment(moment.utc(forecastList[i].dt_txt).toDate()).local()
    forecastList[i].dt_txt = forecastList[i].mDt_txt.format('YYYY-MM-DD HH:mm:ss')
  }
  return forecastList
}

function handleWeekendQueries (parameters, json, method) {
  for (let i = 1; i < 5; i++) {
    if (moment().add(i, 'days').format('dddd MMMM Do').split(' ')[0] === 'Sunday') {
      let cloned = _cloneDeep(json)
      let weekend = cloned.list.reduce((obj, cur) => {
        if (isSameByDayAddDay(cur.mDt_txt, (i - 2))) {
          obj.friday.push(cur)
        }
        if (isSameByDayAddDay(cur.mDt_txt, (i - 1))) {
          obj.saturday.push(cur)
        }
        if (isSameByDayAddDay(cur.mDt_txt, (i))) {
          obj.sunday.push(cur)
        }
        return obj
      }, {friday: [], saturday: [], sunday: []})

      if (parameters.state === 'polar') {
        let weekendList = weekend.friday.concat(weekend.saturday).concat(weekend.sunday)
        return template[method].weekend.polar({
          weekend: checkWeatherPolar(parameters, setWeekendForecast(weekendList, 3), 'Weekend')
        }, city, parameters)
      } else {
        return template[method].weekend.forecast({
          friday: setWeatherObj(weekend.friday),
          saturday: setWeatherObj(weekend.saturday),
          sunday: setWeatherObj(weekend.sunday)
        }, city)
      }
    }
  }
  return template[method].limit
}

function setWeekendForecast (forecastList, numberDay) {
  let forecast = []
  for (let i = 0; i < numberDay; i++) {
    let day = parseDayForecast(forecastList)
    forecast.push(day)
  }
  return forecast
}

function handleNumberDayForecast (parameters, json, city, method) {                                                     // >= 5 day forecast (never polar)
  let forecastArr
  let numberDay = w2n.convert(parameters.numberDay.split(' ')[0])
  if (numberDay > 5) {
    return (`${template[method].limit} ${handleFiveDayForecast(parameters, json, city, parameters.date, method)}`)
  } else {
    forecastArr = setNumberDayForecast(json.list, numberDay)
    return template[method].fiveDay(forecastArr, city)
  }
}

function handleFiveDayForecast (parameters, json, city, date, method) {                                                 // = 5 day forecast (sometimes polar)
  let forecastArr = setNumberDayForecast(json.list, 5)
  if (parameters.state === 'polar') {
    let forecast = checkWeatherPolar(parameters, forecastArr, date)
    let dateFormat = 'dddd, MMMM D[st], YYYY'
    forecast.date = isTomorrow(moment(forecast.date, dateFormat)) ? 'tomorrow'
      : forecast.date
    return template[method].fiveDayPolar(forecast, city)
  } else {
    return template[method].fiveDay(forecastArr, city)
  }
}

function handleWeatherTodayOrFuture (parameters, json, today, city, mDate, method) {                                    // today and/or future (polar)
  let timeOfDay = setTimeOfDay(parameters.time, today, mDate)
  json.list = filterOnDate(json, today, mDate)
  json.list = filterOnTime(json, today, mDate, timeOfDay)
  let weatherObj
  if (parameters.state === 'polar') {
    let weatherArr = formatList(json.list)
    weatherObj = checkWeatherPolar(parameters, weatherArr)
    if (!today) timeOfDay = checkTomorrow(mDate)
    return today ? template[method].Polar.today(weatherObj, timeOfDay)
      : template[method].Polar.future(weatherObj, timeOfDay)
  } else {
    return chooseTemplate(json, today, parameters, city, timeOfDay, method, mDate)                                      // today and/or future (non polar)
  }
}

function filterOnDate (json, today, mDate) {
  today ? json.list = json.list.filter(onToday) : json.list = json.list.filter(onMDate.bind(this, mDate))
  return json.list
}

function filterOnTime (json, today, mDate, timeOfDay) {
  let temp = _cloneDeep(json.list)
  let filterDate = today ? moment() : _cloneDeep(mDate)
  switch (true) {
    case timeOfDay.includes('night'):
      temp = temp.filter((listItem) => {
        return moment(listItem.mDt_txt).isAfter(filterDate.set({hour: 17, minute: 0, second: 0})) &&
          moment(listItem.mDt_txt).isBefore(filterDate.add(1, 'days').set({hour: 1, minute: 0, second: 0}))
      })
      break
    case timeOfDay.includes('morning'):
      temp = temp.filter((listItem) => {
        return moment(listItem.mDt_txt).isBefore(filterDate.set({hour: 15, minute: 0, second: 0}))
      })
      break
    default:
      return json.list
  }
  if (temp.length > 0) json.list = temp
  return json.list
}

function filterOnSpecific (forecastArray, parameters) {
  parameters.weather = weatherHelper.sunnyToClear(parameters.weather)
  parameters.weather = weatherHelper.skiesToSky(parameters.weather)
  let arrToReturn = []
  for (let i = 0; i < forecastArray.length; i++) {
    let weatherDescription = forecastArray[i].weather[0].description
    if (weatherDescription.includes(parameters.weather)) {
      arrToReturn.push(forecastArray[i])
    }
  }
  console.log('arr to return: ', arrToReturn)
  console.log('forecast array: ', forecastArray)
  return arrToReturn.length > 0 ? setWeatherObj(arrToReturn) : setWeatherObj(forecastArray)
}

function chooseTemplate (forecast, today, parameters, city, timeOfDay, method) {
  let weatherObj = filterOnSpecific(forecast.list, parameters)
  let general = today ? template[method].today(city, weatherObj, timeOfDay)
    : template[method].future(city, timeOfDay, weatherObj)
  let specific = today ? template[method].todaySpecific(city, weatherObj, timeOfDay, parameters)
    : template[method].futureSpecific(city, weatherObj, timeOfDay, parameters)
  return parameters.weather ? specific : general
}

function setWeatherObj (list) {
  let forecast = list[0].weather[0].description
  return {
    current: kelvinToFahrenheit(list[0].main.temp),
    low: weatherHelper.kelvinToFahrenheit(list[0].main.temp_min),
    high: weatherHelper.kelvinToFahrenheit(list[0].main.temp_max),
    wind: {
      speed: list[0].wind.speed,
      direction: weatherHelper.getDirection(list[0].wind.deg)
    },
    snow: list[0].snow && list[0].snow['3h'] ? list[0].snow['3h'] : '0',
    rain: list[0].rain && list[0].rain['3h'] ? list[0].rain['3h'] : '0',
    forecast: weatherHelper.skyToSkies(forecast)
  }
}

function checkWeatherPolar (params, forecastArr, date) {
  let forecast = {
    ans: 'No',
    weatherDesc: forecastArr[0].weatherDesc,
    state: params.weather,
    date: date
  }
  params.weather = weatherHelper.sunnyToClear(params.weather)
  params.weather = weatherHelper.skiesToSky(params.weather)
  for (let i = 0; i < forecastArr.length; i++) {
    let weatherDescription = forecastArr[i].weatherDesc
    if (weatherDescription.includes(params.weather)) {
      forecast.ans = 'Yes'
      forecast.weatherDesc = weatherDescription
      forecast.date = forecastArr[i].date
      return forecast
    }
  }
  return forecast
}

function setNumberDayForecast (forecastList, numberDay) {
  let forecast = []
  for (let i = 0; i < numberDay; i++) {
    let day = parseDayForecast(forecastList.filter((onMDate.bind(this, moment().add((i + 1), 'days')))))
    forecast.push(day)
  }
  return forecast
}

function formatList (forecastList) {
  let weatherArr = []
  for (let i = 0; i < forecastList.length; i++) {
    let obj = {}
    obj.weatherDesc = forecastList[i].weather[0].description
    weatherArr.push(obj)
  }
  return weatherArr
}

function parseDayForecast (forecastList) {
  let badWeather = forecastList.find(getBadWeather)
  let desc = badWeather ? badWeather.weather[0].description : forecastList[0].weather[0].description
  let high = forecastList.sort((x, y) => {
    return y.main.temp_max - x.main.temp_max
  })[0].main.temp_max
  let low = forecastList.sort((x, y) => {
    return x.main.temp_min - y.main.temp_min
  })[0].main.temp_min
  desc = weatherHelper.skyToSkies(desc)

  return {
    weatherDesc: desc,
    high: weatherHelper.kelvinToFahrenheit(high),
    low: weatherHelper.kelvinToFahrenheit(low),
    date: moment(forecastList[0].dt_txt).format('dddd MMMM Do')
  }
}

function getBadWeather (weatherObj) {
  return weatherObj.weather[0].description.includes('rain') || weatherObj.weather[0].description.includes('snow')
}

function onToday (listItem) {
  return moment(listItem.dt_txt).isSame(moment().format('YYYY-MM-DD'), 'days')
}

function onMDate (mDate, listItem) {
  return listItem.mDt_txt.isSame(mDate, 'days')
}

function checkTomorrow (mDate) {
  return mDate.isSame(moment().add(1, 'days'), 'days') ? 'tomorrow' : mDate.format('dddd MMMM Do')
}

function fetchWeather (city) {
  let path = 'forecast'
  return requestAsync({
    url: `https://api.openweathermap.org/data/2.5/${path}`,
    json: true,
    qs: {
      q: city,
      appid: `53dd45d0de78a57b7c419f5b36763f8e`
    }
  })
}

function setTimeOfDay (time, today, mDate) {
  if (time.includes('evening') || time.includes('tonight')) {
    return checkToday(today, 'tonight', mDate)
  } else if (time.includes('morning')) {
    return checkToday(today, 'this morning', mDate)
  } else if (today) {
    return 'today'
  } else if (isTomorrow(mDate)) {
    return 'tomorrow'
  } else {
    return mDate.format('dddd MMMM Do')
  }
}

function checkToday (today, timeOfDay, mDate) {
  let mDateArr
  if (!today) {
    if (isTomorrow(mDate) && timeOfDay === 'tonight') {
      return 'tomorrow night'
    } else if (isTomorrow(mDate) && timeOfDay === 'this morning') {
      return 'tomorrow morning'
    } else if (!isTomorrow(mDate) && timeOfDay === 'tonight') {
      mDateArr = mDate.format('dddd MMMM Do').split(' ')
      return `${mDateArr[0]} night ${mDateArr[1]} ${mDateArr[2]}`
    } else if (!isTomorrow(mDate) && timeOfDay === 'this morning') {
      mDateArr = mDate.format('dddd MMMM Do').split(' ')
      return `${mDateArr[0]} morning ${mDateArr[1]} ${mDateArr[2]}`
    }
  } else {
    return timeOfDay
  }
}

