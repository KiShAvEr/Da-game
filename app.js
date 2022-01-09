const express = require('express')
const http = require('http')
const webSocket = require("ws")
const {createHash} = require('crypto')

class GameState {
  constructor() {
    this.board = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]]
    this.playerOneTurn = true
    this.wins = {
      "playerOne": 0,
      "playerTwo": 0,
    }
    this.lastMove = null
    this.winner = 0
  }

  dropBall(col, player) {
    if(this.winner == 0) {
      for(let i = 5; i >= 0; i--) {
        if(this.board[col][i] == 0) {
          this.board[col][i] = player
          this.lastMove = {
            col,
            "row": i,
            player: player == 1? "playerOne": "playerTwo"
          }
          this.playerOneTurn = !this.playerOneTurn
  
          this.winner = this.checkWin()
    
          if(this.winner == 1) {
            this.wins.playerOne += 1
            const moves = this.board.flat().filter(num => num == 1).length
            fastest = fastest === 0? moves: Math.min(moves, fastest)
          }
          if(this.winner == 2) {
            this.wins.playerTwo += 1
            const moves = this.board.flat().filter(num => num == 1).length
            fastest = fastest === 0? moves: Math.min(moves, fastest)
          }

          if(this.winner != 0) {
            completed++
          }
  
          return {
            gameState: this,
            error: null
          }
        }
      }
    }
    else {
      return {
        gameState: this,
        error: null
      }
    }

    return {
      gameState: this,
      error: "Column is full!"
    }
  }

  resetGame() {
    this.board = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]]
    this.playerOneTurn = (this.wins.playerOne+this.wins.playerTwo)%2 == 0
    this.lastMove = null
    this.winner = 0
  }

  checkWin = () => {

    const checkTheVertical = (board) => {
      for(let col of board) {
        for(let i = 0; i < 3; i++) {
          if(col[i] != 0 && col[i] == col[i+1] && col[i] == col[i+2] && col[i] == col[i+3]) return col[i]
        }
      }
      return 0
    }
    
    const checkTheHorizontal = (board) => {
      for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 6; j++) {
          if(board[i][j] != 0 && board[i][j] == board[i+1][j] && board[i][j] == board[i+2][j] && board[i][j] == board[i+3][j]) return board[i][j]
        }
      }
      return 0
    }
    
    const checkTheDiagonal = (board) => {
      for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 3; j++) {
          if(board[i][j] != 0 && board[i][j] == board[i+1][j+1] && board[i][j] == board[i+2][j+2] && board[i][j] == board[i+3][j+3]) return board[i][j]
        }
      }
      for(let i = 3; i < 7; i++) {
        for(let j = 0; j < 3; j++) {
          if(board[i][j] != 0 && board[i][j] == board[i-1][j+1] && board[i][j] == board[i-2][j+2] && board[i][j] == board[i-3][j+3]) return board[i][j]
        }
      }
      return 0
    }
  
  
    const diagonal = checkTheDiagonal(this.board)          //3000000
    const vertical = checkTheVertical(this.board)
    const horizontal = checkTheHorizontal(this.board)
  
    if(diagonal != 0) {
      return diagonal
    }
  
    if(vertical != 0) {
      return vertical
    }
  
    if(horizontal != 0) {
      return horizontal
    }
  
    if(!this.board.flat().includes(0)) {
      return -1
    }
  
    return 0
  
  }

}


class Game {
  constructor(p1, p2) {
    this.playerOne = p1
    this.playerTwo = p2
    this.gameState = new GameState()
  }
}




const port = process.env.PORT || process.argv[2] || 3000
const app = express()

app.use(express.static(__dirname + "/public"))

app.set("view engine", "ejs")
app.get("/", (req, res) => {
  res.render([__dirname, "/public/splash.ejs"].join(""), {completed, fastest, ongoing: Object.keys(games).length/2})
})

app.get("/data", (req,res) => {
  res.send({completed, ongoing: Object.keys(games).length/2, fastest})
})

app.get("/link", (req,res) => {
  res.send({link: Math.random() < 0.5 ? "https://youtu.be/dQw4w9WgXcQ": "https://paypal.me/varadiistvan"})
})

app.get("/*", (req, res) => {
  res.sendFile([__dirname, "/public/game.html"].join(""))
})

const server = http.createServer(app)

server.listen(port)

const wss = new webSocket.Server({noServer: true})

let counter = 0

let queue = []

let lobbies = {}

let completed = 0

let fastest = 0

setInterval(() => {
  if(queue.length > 1) {
    let game
    const con = queue.shift()
    const otherPlayer = queue.shift()
    const order = Math.floor(Math.random()*2)
    switch(order) {
      case 0: {
        game = new Game(con, otherPlayer)
        con.send("playerOne")
        otherPlayer.send("playerTwo")
        break;
      }
      case 1: {
        game = new Game(otherPlayer, con) 
        con.send("playerTwo")
        otherPlayer.send("playerOne")
        break;
      }
    }
  }
}, 1000)

let games = {}

server.on("upgrade", (req, sock, head) => {
  wss.handleUpgrade(req, sock, head, (ws) => {
    wss.emit("connection", ws, req)
  })
  
})

wss.on("connection", (ws, req) => {
  const con = Object.assign(ws, {id: counter++, wantsToRematch: undefined})

  let lobbyName

  if(req.url === "/board") {
     
    if(queue.length == 0) {
      queue.push(con)
      con.send("waiting")
    }
    else {
      const otherPlayer = queue.shift()
      let game
      const order = Math.floor(Math.random()*2)
      switch(order) {
        case 0: {
          game = new Game(con, otherPlayer)
          con.send("playerOne")
          otherPlayer.send("playerTwo")
          break;
        }
        case 1: {
          game = new Game(otherPlayer, con) 
          con.send("playerTwo")
          otherPlayer.send("playerOne")
          break;
        }
      }
      games[otherPlayer.id] = game
      games[con.id] = game
      con.send(JSON.stringify({
        "gameState": game.gameState,
        "error": null
      }))
      otherPlayer.send(JSON.stringify({
        "gameState": game.gameState,
        "error": null
      }))
    }
  }

  else if(req.url.substring(0, 6) === "/lobby") {
    lobbyName = new URLSearchParams(req.url.substring(7)).get("name")
    if(lobbyName && (lobbyName.toLocaleLowerCase() === "board" || lobbyName.toLocaleLowerCase() === "lobby")) {
      con.close(4003, "invalid")
      return
    }
    if(!lobbyName) {
      lobbyName = createHash("sha512").update(con.id.toString()).digest("base64url").substring(0, 12)
      lobbies[lobbyName] = con
      con.send(JSON.stringify({"lobby": lobbyName}))
    }
    else {
      if(lobbies[lobbyName]) {
        con.close(4000, "taken")
      }
      else {
        lobbies[lobbyName] = con
        con.send(JSON.stringify({"lobby": lobbyName}))
      }
    }
    con.send("waiting")
  }

  else {
    if(lobbies[req.url.substring(1)]) {
      const otherPlayer = lobbies[req.url.substring(1)]
      delete lobbies[req.url.substring(1)]
      let game
      const order = Math.floor(Math.random()*2)
      switch(order) {
        case 0: {
          game = new Game(con, otherPlayer)
          con.send("playerOne")
          otherPlayer.send("playerTwo")
          break;
        }
        case 1: {
          game = new Game(otherPlayer, con) 
          con.send("playerTwo")
          otherPlayer.send("playerOne")
          break;
        }
      }
      games[otherPlayer.id] = game
      games[con.id] = game
      con.send(JSON.stringify({
        "gameState": game.gameState,
        "error": null
      }))
      otherPlayer.send(JSON.stringify({
        "gameState": game.gameState,
        "error": null
      }))
    }
    else {
      con.close(4002, "nonexistent")
    }
  }

  con.onmessage = (ev) => {
    if(typeof ev.data != "string") {
      return
    }
    const data = JSON.parse(ev.data)
    switch(data.actionName) {
      case "drop": {
        const game = games[con.id]
        const playerNum = game.playerOne == con? 1: 2
        const res = game.gameState.dropBall(data.action, playerNum)
        game.playerOne.send(JSON.stringify(res))
        game.playerTwo.send(JSON.stringify(res))
        break
      }
      case "rematch": {
        const game = games[con.id]
        con.wantsToRematch = true
        if(game.playerOne.wantsToRematch && game.playerTwo.wantsToRematch) {
          game.gameState.resetGame()
          game.playerOne.wantsToRematch = undefined
          game.playerTwo.wantsToRematch = undefined
          const response = JSON.stringify({"gameState": game.gameState, "error": null})
          game.playerOne.send(response)
          game.playerTwo.send(response)
        }
        break
      }
    }
  }

  con.onclose = (ev) => {
    const game = games[con.id]

    queue = queue.filter(connection => connection.id != con.id)

    if(lobbyName) delete lobbies[lobbyName]

    if(game) {
      if(game.playerOne.readyState != 2 && game.playerOne.readyState != 3) {
        game.playerOne.close(4001, "disconnect")
      }
  
      if(game.playerTwo.readyState != 2 && game.playerTwo.readyState != 3) {
        game.playerTwo.close(4001, "disconnect")
      }

      delete games[game.playerOne.id]
      delete games[game.playerTwo.id]

    }
  }

})




console.log(`Server running on port ${port}`)
