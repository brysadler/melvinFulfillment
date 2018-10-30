const moment = require('moment')
const request = require('../utils/request').requestAsync
const http = require('http')
const config = require('../config').handler.sports
const template = require('../templates/sports')
const TIME_FORMAT = config.timeFormat
const DATE_FORMAT = config.dateFormat

exports.execute = (method, parameters) => {
  switch (method) {
    case 'sports':
      return getSportsInfo(method, parameters)
    default:
      return Promise.resolve(template.default())
  }
}

function getSportsInfo (method, parameters) {
  if (parameters.season) {
    if (moment().set('year', (parameters.season))
        .isBefore(moment().add(-2, 'years'))) return Promise.resolve(template[method].yearLimit(parameters.season))
    if (moment().set('year', (parameters.season))
        .isAfter(moment())) return Promise.resolve(template[method].future(parameters.season))
  }

  return fetchSportsInfo (method, parameters)
    .then((json) => {
      //console.log(json)
      return parseData(json, method, parameters)
    })
    .catch((error) => {
      console.log(error)
    })
}

// https://api.fantasydata.net/v3/${sport}/${type}/JSON/${get}/${season}/${week}
function fetchSportsInfo (method, parameters) {
  let url = config.url
  let date = parameters.date ? moment(parameters.date).format('YYYY-MMM-DD').toUpperCase() : ''
  let sport = parameters.sport
  let type = parameters.type
  let content = parameters.content
  let season = parameters.season
  let specific = parameters.specific
  let path = `${sport}/${type}/JSON/${content}${season ? '/' + season + '/' : ''}${date ? '/' + date + '' : ''}${specific ? specific : ''}`
  console.log(`${url}${path}`)
  return request({
    url: `${url}${path}`,
    headers: {
      "Ocp-Apim-Subscription-Key": `6ac2382a9c7240b38a4e70f776640560`
    }
  })
}

function parseData (json, method, parameters) {
  let content = parameters.content
  json = typeof json === 'string' ? JSON.parse(json) : json

  let stories = parseNews(json)
  switch (content) {
    case 'news':
      return template[method].news.threeStories(stories)
    case 'NewsByDate':
      return template[method].news.byDate(stories)
    case 'NewsByPlayer':
      return template[method].news.byPlayer(stories)
    case 'NewsByTeam':
      return template[method].news.byTeam(stories)
    default:
      return template.default
  }
}

function parseNews (json) {
  let stories = []
  for (let i = 0; i < 3; i++) {
    stories.push(json[i].Content)
  }
  return stories
}