var http = require('http')

function writeRequest (req) {
  function writeSomeData () {
    console.log('[client] writing data')
    req.write(new Buffer(5600000))
  }

  function writeLastData () {
    console.log('[client] writing last data')
    req.end('fin')
  }

  setTimeout(writeSomeData, 100)
  setTimeout(writeSomeData, 200)
  setTimeout(writeSomeData, 300)
  setTimeout(writeSomeData, 400)
  setTimeout(writeSomeData, 500)
  setTimeout(writeLastData, 600)

  req.on('response', function (res) {
    res.on('data', function (data) {
      console.log('[client] received data', data.length)
    })
    res.on('end', function () {
      console.log('[client] full response received')
    })
  })

  req.on('finish', function () {
    console.log('[client] the stream has finished')
  })
}

exports.writeRequest = writeRequest
