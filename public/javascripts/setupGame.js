const backArrowContainer = document.getElementById("backArrowContainer")

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