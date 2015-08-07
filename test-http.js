var http = require('http')

var client = require('./lib/client')
var server = require('./lib/server')

var port = 5433
var app = http.createServer()

app.on('request', function (req, res) {
  server.handleRequest(req, res, function (err) {
    if (err) throw err

    app.close()
  })
})

app.listen(port, function () {
  var req = http.request({
    port: port, method: 'POST'
  })

  client.writeRequest(req)
})
