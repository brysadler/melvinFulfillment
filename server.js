const app = require('express')()
const routes = require('./routes')
const PORT = require('./config').http.port

let isShuttingDown = false

app.use(routes)
let server = app.listen(PORT, (err) => {
    if (err) throw err
    console.log('http:start', {port: PORT})
})

process.on('uncaughtException', (err) => {
  console.log('process:uncaughtException', err)
  process.emit('SIGINT')
})

process.on('SIGINT', () => {
  console.log('process:sigint', {force: isShuttingDown})

  if(isShuttingDown) {
    isShuttingDown = true
  } else {
    process.exit(1)
  }
})

process.once('SIGINT', () => {
  server.close()
})