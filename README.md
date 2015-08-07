Repository with code for [Node.js bug #25823](https://github.com/joyent/node/issues/25823) and [iojs bug #2323](https://github.com/nodejs/io.js/issues/2323).

-----

I've been spending lots of time tracking this down for [multer](https://github.com/expressjs/multer), and form-data/multipart file uploader for express. Basically what we want to do is; whenever there is an error 1) `unpipe` the request 2) `.resume()` the request so that the browser will consider the request done.

This is implemented something like the code below. `req` is an http request from a browser.

```javascript
function abort (err) {
  req.unpipe(parser)
  req.resume()
  next(err)
}
```

It has been working great, most of the times. It seems like there is a problem when the stream contains too much data. For some reason it just doesn't emit any more `data` events, and the browser is stuck on `uploading (xx%)`.

I've managed to track this down and have a small test-case that is easily replicated. The problem goes all the way down to `net.Socket`.

Calling `req.resume` after `socket.pipe(out2)` doesn't help.

If the size of each buffer (`560000`) is lowered it starts working. The break point on my machine is at 16 KiB, a.k.a `1024 * 16` doesn't work, but `1024 * 16 - 1` works.

### The test case

```javascript
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
      socket.write(new Buffer(560000))
    }, 100)
  })
})
```

### Actual output

```text
[server][out 1] received chunk of data
[server] redirecting to `out 2`
```

### Expected output

```text
[server][out 1] received chunk of data
[server] redirecting to `out 2`
[server][out 2] received chunk of data
[server][out 2] received chunk of data
[server][out 2] received chunk of data
[server][out 2] received chunk of data
[server][out 2] received chunk of data
[server][out 2] received chunk of data
...
```
