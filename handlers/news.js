const NewsApi = require('newsapi')
const moment = require('moment')
const config = require('../config').handler.news
const template = require('../templates/news')

const newsapi = new NewsApi(config.apiKey)

exports.execute = (method, parameters) => {
  switch (method) {
    case 'news':
      return news(method, parameters)
    default:
      return template.default()
  }
}

function news (method, parameters) {
  let date = parameters[date]
  if (moment(date).isAfter(moment())) return template[method].future(moment(date).format('dddd'))
  let process
  if (parameters.subject) {
    process = newsapi.v2.everything({
      q: parameters.subject,
      sources: 'bbc-news, npr-news, bloomberg-news',
      domains: 'bbc.co.uk, npr.org, bloomberg.com',
      from: '',
      to: moment().format('YYYY-MM-DD'),
      language: 'en',
      sortBy: 'relevancy',
      page: ''
    })
  } else {
    process = newsapi.v2.topHeadlines({
      sources: 'bbc-news, npr-news, bloomberg-news',
      domains: 'bbc.co.uk, npr.org, bloomberg.com',
      q: '',
      category: 'business',
      language: 'en',
      country: 'us'
    })
  }

  return process()
    .then((json) => {
      if (parameters.specific) return checkSubject(parameters.specific, json.articles)
      return template[method].topHeadlines(json.articles)
    })
    .catch(() => {
      return template.default()
    })
}

function checkSubject (specific, articles) {
  let articlesFound = []
  for (let i = 0; i < articles.length; i++) {
    let title = articles[i].title
    let description = articles[i].description
    if (title.inclues(specific) || description.includes(specific)) {
      articlesFound.push(articles[i])
    }
  }
  let toReturn = articlesFound.length > 0 ?
    template[method].articlesFound(articlesFound, specific) : template[method].noArticlesFound()
  return toReturn
}