var net = require('net')

var client = require('./lib/client')
var server = require('./lib/server')

var port = 5433
var app = net.createServer()

app.on('connection', function (socket) {
  server.handleRequest(socket, socket, function (err) {
    if (err) throw err

    app.close()
  })
})

app.listen(port, function () {
  var socket = new net.Socket({ allowHalfOpen: true })

  socket.connect(port, function () {
    client.writeRequest(socket)
  })
})
