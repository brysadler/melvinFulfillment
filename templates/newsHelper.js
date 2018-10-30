const helper = {
  loopArticles: (articles) => {
    let stringToReturn = ``
    for (let i = 0; i < articles.length; i++) {
      stringToReturn += `from ${articles[i].title}, ${articles[i].description}.`
    }
    return stringToReturn
  }
}

module.exports = helper