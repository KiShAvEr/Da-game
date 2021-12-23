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
            if (table[i].length >= 6){
                currentCanvas.style.background = "#1f6f86"
            }
        }
    })   
} 