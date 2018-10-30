const newsHelper = require('./newsHelper')
const util = require('../utils')
const names = ['Bryan', 'Sir']
const news = {
  default: () => {
    return `I'm sorry I can't process this request just yet.`
  },
  news: {
    future: (date) => {
      return `${util.randomize(names)} I'm not a fortune cookie. I can't give you news for ${date} as it's in the future`
    },
    topHeadlines: (articles) => {
      return `${util.randomize(names)}, I've found some stories you may find interesting. ${newsHelper.loopArticles(articles)}.`
    },
    articlesFound: (articles, specific) => {
      return `${util.randomize(names)}, I've found some stories pertaining to ${specific}. ${newsHelper.loopArticles(articles)}.`
    },
    noArticlesFound: (specific) => {
      return `${util.randomize(names)} I've not found any information regarding ${specific}. I hope I'm understanding you correctly.`
    }
  }
}

module.exports = news