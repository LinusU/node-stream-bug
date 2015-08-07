var net = require('net')
var stream = require('stream')

var port = 5433
var app = net.createServer()

function logStream (name) {
  var out = new stream.Writable()

  out._write = function (chunk, encoding, cb) {
    console.log('[server][' + name + '] received chunk of data')
    this.emit('chunk-received')
    cb(null)
  }

  return out
}

app.on('connection', function (socket) {
  var out1 = logStream('out 1')
  var out2 = logStream('out 2')

  out1.once('chunk-received', function redirect () {
    console.log('[server] redirecting to `out 2`')
    socket.unpipe(out1)
    socket.pipe(out2)
  })

  socket.pipe(out1)
})

app.listen(port, function () {
  var socket = new net.Socket({ allowHalfOpen: true })

  socket.connect(port, function () {
    setInterval(function () {
      socket.write(new Buffer(5600000))
    }, 100)
  })
})
