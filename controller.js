const handlers = require('./handlers')

exports.execute = (body) => {
  // body devided into device and request
  let parameters = body.request.parameters
  let handler = parameters.handler
  let method = parameters.method
  let device = body.devive

  return handlers[handler].execute(method, parameters, body)
    .catch((err) => {
      console.log('controller:execute:err', {handler: method}, device, err)
      return ''
    })
}