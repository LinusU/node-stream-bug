var http = require('http')
var express = require('express')

var client = require('./lib/client')
var server = require('./lib/server')

var port = 5432
var app = express()
var httpServer

app.use(function (req, res, next) {
  server.handleRequest(req, res, function (err) {
    if (err) throw err

    httpServer.close()
  })
})

httpServer = app.listen(port, function () {
  var req = http.request({
    port: port, method: 'POST'
  })

  client.writeRequest(req)
})
