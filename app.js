const express = require('express')
const http = require('http')
const webSocket = require("ws")


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
    
    for(let i = 5; i >= 0; i--) {
      if(this.board[col][i] == 0) {
        this.board[col][i] = player
        this.lastMove = {
          col,
          "row": i,
          player: player == 1? "playerOne": "playerTwo"
        }
        this.playerOneTurn = !this.playerOneTurn

        this.winner = checkWin(this.board)

        if(this.winner == 1) {
          this.win.playerOne += 1
        }
        if(this.winner == 2) {
          this.win.playerTwo += 1
        }

        return {
          gameState: this,
          error: null
        }
      }
    }

    return {
      gameState: this,
      error: "Column is full!"
    }
  }

  clearTable() {
    this.board = [[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0]]
    this.playerOneTurn = (this.wins.playerOne+this.wins.playerTwo)%2 == 0
  }

}


class Game {
  constructor(p1, p2) {
    this.playerOne = p1
    this.playerTwo = p2
    this.gameState = new GameState()
  }
}

checkWin = (board) => {
  const diagonal = checkTheDiagonal(board)          //3000000
  const vertical = checkTheVertical(board)
  const horizontal = checkTheHorizontal(board)

  if(diagonal != 0) {
    return diagonal
  }

  if(vertical != 0) {
    return vertical
  }

  if(horizontal != 0) {
    return horizontal
  }

}

checkTheVertical = (board) => {
  for(let col of board) {
    for(let i = 0; i < 3; i++) {
      if(col[i] == col[i+1] && col[i] == col[i+2] && col[i] == col[i+3]) return col[i]
    }
  }
  return 0
}

checkTheHorizontal = () => {
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 6; j++) {
      if(board[i][j] == board[i+1][j] && board[i][j] == board[i+2][j] && board[i][j] == board[i+3][j]) return board[i][j]
    }
  }
  return 0
}

checkTheDiagonal = () => {
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 3; j++) {
      if(board[i][j] == board[i+1][j+1] && board[i][j] == board[i+2][j+2] && board[i][j] == board[i+3][j+3]) return board[i][j]
    }
  }
  for(let i = 3; i < 7; i++) {
    for(let j = 0; j < 3; j++) {
      if(board[i][j] == board[i-1][j+1] && board[i][j] == board[i-2][j+2] && board[i][j] == board[i-3][j+3]) return board[i][j]
    }
  }
  return 0
}


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

let queue = []

let games = {}

wss.on("connection", (ws) => {

  if(queue.length == 0) {
    queue.push(ws)
    ws.send("waiting")
  }
  else {
    const otherPlayer = queue.shift()
    let game
    const order = Math.floor(Math.random()*2)
    switch(order) {
      case 0: {
        game = new Game(ws, otherPlayer)
        ws.send("playerOne")
        otherPlayer.send("playerTwo")
        break;
      }
      case 1: {
        game = new Game(otherPlayer, ws) 
        ws.send("playerTwo")
        otherPlayer.send("playerOne")
        break;
      }
    }
    games[otherPlayer] = game
    games[ws] = game
    ws.send(JSON.stringify({
      "gameState": game.gameState,
      "error": null
    }))
    otherPlayer.send(JSON.stringify({
      "gameState": game.gameState,
      "error": null
    }))
  }

  ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data)
    console.log(data)
    switch(data.actionName) {
      case "drop": {
        const game = games[ws]
        const playerNum = game.playerOne == ws? 1: 2
        const res = game.gameState.dropBall(data.action, playerNum)
        console.log(game)
        game.playerOne.send(JSON.stringify(res))
        game.playerTwo.send(JSON.stringify(res))
        break
      }
      case "rematch": {

      }
    }
  }

  return false
})

console.log(`Server running on port ${port}`)