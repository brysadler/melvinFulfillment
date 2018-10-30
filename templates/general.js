const template = {
  default: `Come on sir, you know I cannot yet do that. If I were you I'd get to programming.`,
  time: {
    time: (time) => {
      return `It's about ${time} sir.`
    },
    isTime: (time) => {
      return `Yes sir, it's about ${time}.`
    },
    timeDifference: (time, diff) => {
      let toReturn = ``
      diff < 0 ? toReturn = `Actually, its past ${time} by about ${Math.round(Math.abs(diff))} minutes.`
        : toReturn = `Not yet, you've still about ${Math.round(diff)} minutes.`
      return toReturn
    }
  },
  date: {
    today: (date) => {
      return `Sir, today is ${date}`
    },
    past: (date) => {
      return `It was ${date}`
    },
    future: (date) => {
      return `That date will be ${date}`
    }
  }
}

module.exports = template