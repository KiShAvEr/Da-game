const express = require('express')
const http = require('http')
const webSocket = require("ws")

const port = process.env.PORT || process.argv[2] || 3000
const app = express()

app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
  res.sendFile([__dirname, "/public/splash.html"].join(""))
})

app.get("/board", (req, res) => {
  res.sendFile([__dirname, "/public/game.html"].join(""))
})

const server = http.createServer(app)

server.listen(port)

const wss = new webSocket.Server({server})

wss.on("connection", (ws) => {

  ws.send("fasz vagy")

  ws.on("message", (msg) => {
    console.log(msg.toString());
    return false
  })

  return false
})

console.log(`Server running on port ${port}`)

app.put("/board", (req, res) => {
  res.send("pénisz" + req.body.column)
})