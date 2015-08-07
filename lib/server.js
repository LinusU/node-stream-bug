var stream = require('stream')

function logStream (name) {
  var out = new stream.Writable()

  out._write = function (chunk, encoding, cb) {
    console.log('[server][' + name + '] received chunk of data')
    this.emit('chunk-received')
    cb(null)
  }

  return out
}

function handleRequest (req, res, cb) {
  var out1 = logStream('out 1')
  var out2 = logStream('out 2')

  function redirect () {
    console.log('[server] redirecting to second pipe')
    req.unpipe(out1)
    req.pipe(out2)
  }

  out1.once('chunk-received', redirect)

  req.on('end', function () {
    res.end('Thanks for the data')
    cb(null)
  })

  req.pipe(out1)
}

exports.handleRequest = handleRequest
