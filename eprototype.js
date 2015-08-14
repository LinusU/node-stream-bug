var http = require('http')

var port = 5467
var app = http.createServer()

app.on('request', function (req, res) {
  res.end('No thanks')
})

app.listen(port, function () {
  var req = http.request({
    port: port, method: 'POST'
  })

  req.end(new Buffer(5600000))
})
