const express = require('express')
const http = require('http')

const port = process.env.PORT || process.argv[2] || 3000
const app = express()

app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
  res.sendFile([__dirname, "/public/hehe.html"].join(""))
})

http.createServer(app).listen(port)
