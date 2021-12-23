const backArrowContainer = document.getElementById("backArrowContainer")
let table = [[],[],[],[],[],[],[]]

const ownColor = document.getElementById("yourColor")
const opponentColor = document.getElementById("opponentColor")

let ownPlayer;

let closed = false

const socket = new WebSocket(window.location.href.replace("http", "ws"))

const drawGameState = (lastMove) => {
    if(lastMove) {
        const parent = document.getElementById(`c${lastMove.col}`)
        const child = document.createElement("div")
        child.classList.add(lastMove.player, "token")

        parent.prepend(child)

    }
}

backArrowContainer.addEventListener("click", () => {
    closed = true
    if(socket) socket.close()
})

backArrowContainer.addEventListener("mouseenter", () => {
    for(let element of document.getElementsByClassName("backArrow")) {
        element.style.fill = "gray"
    }
})

backArrowContainer.addEventListener("mouseleave", () => {
    for(let element of document.getElementsByClassName("backArrow")) {
        element.style.fill = "black"
    }
})


fetch(window.location.href.replace("board", "data"))
.then(data => data.json())
.then(res => console.log(res))

socket.onopen = (ev) => {
    //socket.send("mi a péló van")
    return false
}

socket.onmessage = (ev) => {
    switch(ev.data) {
        case "waiting": {
            break
        }
        case "playerOne": {
            ownColor.classList.remove("playerTwo")
            ownColor.classList.add("playerOne")

            document.getElementById("turnString").innerHTML = "Your turn!"

            ownPlayer = "playerOne"

            opponentColor.classList.remove("playerOne")
            opponentColor.classList.add("playerTwo")
            break
        }
        case "playerTwo": {
            opponentColor.classList.remove("playerTwo")
            opponentColor.classList.add("playerOne")

            document.getElementById("turnString").innerHTML = "Opponent's turn!"

            ownColor.classList.remove("playerOne")
            ownColor.classList.add("playerTwo")

            ownPlayer = "playerTwo"

            break
        }
        default: {
            const currentState = JSON.parse(ev.data).gameState
            if(JSON.parse(ev.data).error != null) alert("cringe")
            if(currentState.lastMove === null) {
                Array.from(document.getElementsByClassName("token")).forEach(el => el.parentNode.removeChild(el))
            }
            table = currentState.board
            document.getElementById("yourScore").innerHTML = currentState.wins[ownPlayer]
            document.getElementById("opponentScore").innerHTML = currentState.wins[ownPlayer == "playerOne"? "playerTwo": "playerOne"]
            
            const yourTurn = (currentState.playerOneTurn && ownPlayer == "playerOne") || (!currentState.playerOneTurn && ownPlayer == "playerTwo")
            
            
            if(currentState.winner != 0) {
                document.getElementById("turnString").innerHTML = (currentState.winner == 1 && ownPlayer == "playerOne") || (currentState.winner == 2 && ownPlayer == "playerTwo")
                ? "You won!" 
                :  currentState.winner == -1
                    ? "Issadrawwa"
                    : "You lost :(" 
                    for (let i = 0; i < 7; i++) {
                        let name = "slots" + i;
                        const currentCanvas = document.getElementById(name);
                        currentCanvas.replaceWith(currentCanvas.cloneNode(true))
                    } 

                console.log(currentState.lastMove)

                drawGameState(currentState.lastMove)

                setTimeout(() => {
                    const rematch = confirm("Wanna rematch")

                    socket.send(JSON.stringify({actionName: "rematch", action: rematch}))

                    if(!rematch) {
                        closed = true
                        socket.close()
                    }

                }, 500)

                break
            }
            
            switch(yourTurn) {
                case true: {
                    document.getElementById("turnString").innerHTML = "Your turn!"
                    for (let i = 0; i < 7; i++) {
                        let name = "slots" + i;
                        const currentCanvas = document.getElementById(name);
                        currentCanvas.addEventListener("mouseenter", () => {
                            if (table[i][0] == 0){
                                currentCanvas.src = "./assets/slotsdark.png"
                            }
                        }) 
                        currentCanvas.addEventListener("mouseleave", () => {
                            currentCanvas.src = "./assets/slots.png"
                        })
                        currentCanvas.addEventListener("click", () => {
                            if (table[i][0] == 0){
                                console.log("ball dropped in canvas " + i)
                                table[i].push("x")
                                socket.send(JSON.stringify({"action": i, "actionName": "drop"}))
                                currentCanvas.src = "./assets/slots.png"
                            }
                        })   
                    } 
                    break
                }
                case false: {
                    document.getElementById("turnString").innerHTML = "Opponent's turn!"
                    for (let i = 0; i < 7; i++) {
                        let name = "slots" + i;
                        const currentCanvas = document.getElementById(name);
                        currentCanvas.replaceWith(currentCanvas.cloneNode(true))
                    } 
                    break
                }
                default: {
                    console.error("what")
                }
            }

            drawGameState(currentState.lastMove)
        }
    }
    return false
}

socket.onclose = (ev) => {
    if(!closed) alert("Opponent disconnected")
    window.location.href = window.location.href.replace("board", "")
}
