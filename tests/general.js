const clone = require('lodash.clonedeep')
const nock = require('nock')
const moment = require('moment')
const should = require('chai').should()
const handler = require('../handlers/general')
const config = require('../config').handler.general
const template = require('../templates/general')

let gblParams = {
  time: new Date()
}

describe('general functions', () => {
  it('default', (done) => {
    handler.execute('default', null)
      .then((res) => {
        res.should.eq(template.default)
        done()
      })
      .catch(done)
  })

  describe('time', () => {
    it('time', (done) => {
      let parameters = clone(gblParams)
      handler.execute('time', parameters)
        .then((res) => {
          res.should.eq(`It's about ${moment().format(config.timeFormat)} sir.`)
          done()
        })
        .catch(done)
    })
    it('isTime', (done) => {
      let parameters = clone(gblParams)
      parameters.state = 'polar'
      handler.execute('time', parameters)
        .then((res) => {
          res.should.eq(`Yes sir, it's about ${moment().format(config.timeFormat)}.`)
          done()
        })
        .catch(done)
    })
    it('isDifference > 0', (done) => {
      let parameters = clone(gblParams)
      parameters.time = moment().add(11, 'minutes')
      parameters.state = 'polar'
      handler.execute('time', parameters)
        .then((res) => {
          res.should.eq(`Actually, its past ${parameters.time.format(config.timeFormat)} by about 11 minutes.`)
          done()
        })
        .catch(done)
    })
    it('isDifference < 0', (done) => {
      let parameters = clone(gblParams)
      parameters.time = moment().add(-11, 'minutes')
      parameters.state = 'polar'
      handler.execute('time', parameters)
        .then((res) => {
          res.should.eq(`Not yet, you've still about 11 minutes.`)
          done()
        })
        .catch(done)
    })
  })

  describe('date', () => {
    it('today', (done) => {
      let parameters = clone(gblParams)
      parameters.date = 'today'
      handler.execute('date', parameters)
        .then((res) => {
          res.should.eq(`Sir, today is ${moment().format(config.dateFormat)}`)
          done()
        })
        .catch(done)
    })
    it('past', (done) => {
      let parameters = clone(gblParams)
      parameters.date = moment().add(-1, 'days')
      handler.execute('date', parameters)
        .then((res) => {
          res.should.eq(`It was ${parameters.date.format(config.dateFormat)}`)
          done()
        })
        .catch(done)
    })
    it('future', (done) => {
      let parameters = clone(gblParams)
      parameters.date = moment().add(1, 'days')
      handler.execute('date', parameters)
        .then((res) => {
          res.should.eq(`That date will be ${parameters.date.format(config.dateFormat)}`)
          done()
        })
        .catch(done)
    })
  })
})