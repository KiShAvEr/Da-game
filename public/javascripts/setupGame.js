const backArrowContainer = document.getElementById("backArrowContainer")
const table = [[],[],[],[],[],[],[]]

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
    socket.send("mi a péló van")
    return false
}

socket.onmessage = (ev) => {
    console.log(ev.data)
    return false
}

socket.onclose = (ev) => {
    console.log("what", ev)
}


for (let i = 0; i < 7; i++) {
    let name = "c" + i;
    const currentCanvas = document.getElementById(name);
    currentCanvas.addEventListener("mouseenter", () => {
        if (table[i].length < 6){
            currentCanvas.style.background = "#134653"
        }
    }) 
    currentCanvas.addEventListener("mouseleave", () => {
        currentCanvas.style.background = "#1f6f86"
    })
    currentCanvas.addEventListener("click", () => {
        if (table[i].length < 6){
            console.log("ball dropped in canvas " + i)
            table[i].push("x")
            socket.send({"column": i})
            if (table[i].length >= 6){
                currentCanvas.style.background = "#1f6f86"
            }
        }
    })   
} 