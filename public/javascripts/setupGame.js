const backArrowContainer = document.getElementById("backArrowContainer")    //setting up constants
const ownColor = document.getElementById("yourColor")
const opponentColor = document.getElementById("opponentColor")
const socket = new WebSocket(window.location.href.replace("http", "ws"))

let table = [[],[],[],[],[],[],[]]      //this will store the current board state
let ownPlayer;                          //playerOne or playerTwo
let closed = false                      //keeps track of whether this user has closed a connection (to alert opponent)


const drawGameState = (lastMove) => {   //updating the board with the given last move
    if(lastMove) {
        const parent = document.getElementById(`c${lastMove.col}`)
        const child = document.createElement("div")
        child.classList.add(lastMove.player, "token")
        parent.prepend(child)
    }
}

backArrowContainer.addEventListener("click", () => {    //close the connection if the user clicks the back button
    closed = true
    if(socket) socket.close()
})



backArrowContainer.addEventListener("mouseenter", () => {       //make the back button a bit more interactive
    for(let element of document.getElementsByClassName("backArrow")) {
        element.style.fill = "gray"
    }
})
backArrowContainer.addEventListener("mouseleave", () => {
    for(let element of document.getElementsByClassName("backArrow")) {
        element.style.fill = "black"
    }
})

socket.onmessage = (ev) => {        //if we receive a message
    switch(ev.data) {      
        case "waiting": {               //placeholder for when we have to wait for an opponent
            break
        }
        case "playerOne": {             //playerOne and playerTwo signify which player you are, this part sets up the game accordingly
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
        default: {      //in every other case, it's a new game state being received
            switch(JSON.parse(ev.data).gameState) {
                case undefined: {
                    document.getElementById("inviteLink").innerHTML = "Invite link: " + window.location.origin + "/" + JSON.parse(ev.data).lobby
                    break
                }
                
                default: {
                    const currentState = JSON.parse(ev.data).gameState
                    const yourTurn = (currentState.playerOneTurn && ownPlayer == "playerOne") || (!currentState.playerOneTurn && ownPlayer == "playerTwo")
        
                    if(JSON.parse(ev.data).error != null) alert("cringe")   //alert if there is an error
                    if(currentState.lastMove === null) {                    //if this is going to be the first step of a new game
                        Array.from(document.getElementsByClassName("token")).forEach(el => el.parentNode.removeChild(el))  //remove all tokens from the board
                    }
        
                    table = currentState.board          //save the game state sent by the server
                    document.getElementById("yourScore").innerHTML = currentState.wins[ownPlayer]       //assign scores
                    document.getElementById("opponentScore").innerHTML = currentState.wins[ownPlayer == "playerOne"? "playerTwo": "playerOne"]
                    
                    
                    if(currentState.winner != 0) {  //if the game is over, change the string on top accordingly
                        document.getElementById("turnString").innerHTML = 
                            (currentState.winner == 1 && ownPlayer == "playerOne") || (currentState.winner == 2 && ownPlayer == "playerTwo")
                                ? "You won!" 
                                :  currentState.winner == -1
                                    ? "Issadrawwa"
                                    : "You lost :(" 
        
                        for (let i = 0; i < 7; i++) {   //also, disable the clickable board
                            let name = "slots" + i;
                            const currentCanvas = document.getElementById(name);
                            document.getElementById(name).replaceWith(currentCanvas.cloneNode(true))
                        } 
        
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
                    break
                }
            }
        }
    }
    return false
}



socket.onclose = (/** @type {CloseEvent} */ ev) => {
    console.log(ev)
    if(ev.reason == "taken") alert("Lobby name is already taken")
    else if(ev.reason == "disconnect") alert("Opponent disconnected")
    else if(!closed) alert("Unexpected error in bagging area")
    window.location.href = window.location.origin
}
