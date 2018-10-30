const clone = require('lodash.clonedeep')
const nock = require('nock')
const moment = require('moment')
const should = require('chai').should()
const handler = require('../handlers/sports')
const testData = require('./testData/NFLNews')
const config = require('../config').handler.sports
const template = require('../templates/sports')
const nockHeaders = {reqHeaders: {"Ocp-Apim-Subscription-Key": `6ac2382a9c7240b38a4e70f776640560`}}
let parameters

let gblParams = {
  time: new Date(),
}

describe('sports', () => {
  it('default', (done) => {
    parameters = clone(gblParams)
    handler.execute('default', parameters)
      .then((res) => {
        res.should.eq('Sir, I\'m having trouble understanding you right now. Perhaps you should try being a better developer.')
        done()
      })
      .catch(done)
  })
  it('2 year limit', (done) => {
    parameters = clone(gblParams)
    parameters.season = '2014'
    handler.execute('sports', parameters)
      .then((res) => {
        res.should.eq(`Sir, I cannot look up sports information from earlier than ${parameters.season}. Maybe we might think about paying for the
      premium API version instead of spending our money on Jameson.`)
        done()
      })
      .catch(done)

  })
  it('future', (done) => {
    parameters = clone(gblParams)
    parameters.season = '2019'
    handler.execute('sports', parameters)
      .then((res) => {
        res.should.eq(`I'm not sure if I can look up ${parameters.season} sports info. TBD bryan.`)
        done()
      })
      .catch(done)
  })

  describe('NFL', () => {
    it('News', (done) => {
      nock(`${config.url}`, nockHeaders)
        .get('/nfl/scores/JSON/news')
        .reply(200, testData.news)
      parameters = clone(gblParams)
      parameters.sport = 'nfl'
      parameters.content = 'news'
      parameters.type = 'scores'
      handler.execute('sports', parameters)
        .then((res) => {
          res.should.eq(`Well sir, it looks like the top stories are Free agent quarterback Drew Brees is unlikely to move away from New Orleans, but Ian Rapoport of the NFL Network says that the Vikings have approached the future Hall of Famer. Restricted free agent running back Corey Grant was tendered at the second-round level by the Jaguars. Buffalo Bills offensive tackle Cordy Glenn was traded to the Cincinnati Bengals, according to Josina Anderson of ESPN. `)
          nock.cleanAll()
          done()
        })
        .catch(done)
    })
    it('News by date', (done) => {
      nock(`${config.url}`, nockHeaders)
        .get('/nfl/scores/JSON/NewsByDate/2018-JAN-22')
        .reply(200, testData.byDate)
      parameters = clone(gblParams)
      parameters.sport = 'nfl'
      parameters.content = 'NewsByDate'
      parameters.type = 'scores'
      parameters.date = '2018-01-22'
      handler.execute('sports', parameters)
        .then((res) => {
          res.should.eq(`It appears that the top stories about undefined are Ohio State co-offensive coordinator Ryan Day, who is a candidate for the Titans offensive coordinator position, is expected to remain at Ohio State, according to a source. Tennessee Titans offensive coordinator Terry Robiskie was fired Monday. The New York Giants announced earlier Monday that Vikings offensive coordinator Pat Shurmur has been named the 18th head coach in team history. `)
          //nock.cleanAll()
          done()
        })
        .catch(done)
    })
    // it('News by player', (done) => {
    //
    // })
    it('News by team', (done) => {
      parameters = clone(gblParams)
      parameters.sport = 'nfl'
      parameters.content = 'NewsByTeam'
      parameters.type = 'scores'
      parameters.team = 'bengals'
      handler.execute('sports', parameters)
        .then((res) => {
          res.should.eq(`It appears that the top stories about undefined are Ohio State co-offensive coordinator Ryan Day, who is a candidate for the Titans offensive coordinator position, is expected to remain at Ohio State, according to a source. Tennessee Titans offensive coordinator Terry Robiskie was fired Monday. The New York Giants announced earlier Monday that Vikings offensive coordinator Pat Shurmur has been named the 18th head coach in team history. `)
          //nock.cleanAll()
          done()
        })
        .catch(done)
    })
  })
})