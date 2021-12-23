const backArrowContainer = document.getElementById("backArrowContainer")
let table = [[],[],[],[],[],[],[]]

const ownColor = document.getElementById("yourColor")
const opponentColor = document.getElementById("opponentColor")

let ownPlayer;

const drawGameState = (lastMove) => {
    if(lastMove) {
        const parent = document.getElementById(`c${lastMove.col}`)
        const child = document.createElement("div")
        child.classList.add(lastMove.player, "token")

        parent.prepend(child)


        
    }
}

backArrowContainer.addEventListener("click", () => {
    window.open(window.location.href.replace("board", ""), "_self")
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

const socket = new WebSocket("ws://localhost:3000")

socket.onopen = (ev) => {
    //socket.send("mi a péló van")
    return false
}

socket.onmessage = (ev) => {
    switch(ev.data) {
        case "waiting": {
            alert("waiting")
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
            table = currentState.board
            document.getElementById("yourScore").innerHTML = currentState.wins[ownPlayer]
            document.getElementById("opponentScore").innerHTML = currentState.wins[ownPlayer == "playerOne"? "playerTwo": "playerOne"]

            const yourTurn = (currentState.playerOneTurn && ownPlayer == "playerOne") || (!currentState.playerOneTurn && ownPlayer == "playerTwo")

            console.log(yourTurn, ownPlayer, currentState.playerOneTurn)

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
    console.log("what", ev)
}
