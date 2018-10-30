const template = {
  default: (method) => {
    return `Sir, I'm having trouble understanding you right now. Perhaps you should try being a better developer.`
  },
  sports: {
    yearLimit: (year) => {
      return `Sir, I cannot look up sports information from earlier than ${year}. Maybe we might think about paying for the
      premium API version instead of spending our money on Jameson.`
    },
    future: (year) => {
      return `I'm not sure if I can look up ${year} sports info. TBD bryan.`
    },
    news: {
      threeStories: (stories) => {
        return `Well sir, it looks like the top stories are${loopResponse(stories)}`
      },
      byPlayer: (stories, player) => {
        return `It appears that the top stories about ${player} are${loopResponse(stories)}`
      },
      byDate: (stories, date) => {
        //console.log(stories)
        return `It appears that the top stories about ${date} are${loopResponse(stories)}`
      },
      byTeam: (stories, team) => {
        return `It appears that the top stories about ${team} are${loopResponse(stories)}`
      }
    }
  }
}

module.exports = template

function loopResponse (stories) {
  //console.log(stories.length)
  let toReturn = ` `
  for (let i = 0; i < stories.length; i++) {
    toReturn += `${stories[i]} `
  }
  return toReturn
}