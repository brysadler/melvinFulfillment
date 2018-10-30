const request = require('request')

exports.requestAsync = (options) => {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        err._message = 'utils:requestAsyncError'
      }

      if (res.statusCode !== 200) {
        return reject({
          body: body,
          statusCode: res.statusCode,
          message: 'utils:requestAsyncNot200'
        })
      }
      resolve(body)
    })
  })
}