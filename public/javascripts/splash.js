document.getElementById("queue").onclick = () => {
    window.location.href = [window.location.href, "board"].join("")
}

document.getElementById("create").onclick = () => {
    const lobbyName = prompt("pp") 
    if (lobbyName != null && lobbyName != undefined) window.location.href = [window.location.href, "lobby", (lobbyName && "?name=" + lobbyName) || ""].join("")

}

document.getElementById("join").onclick = () => {
    const lobbyName = prompt("pp")
    if (lobbyName != null && lobbyName != undefined) window.location.href = [window.location.href, lobbyName].join("")

}

document.getElementById("donate").onclick = () => {
    fetch([window.location.href, "link"].join("")).then((res) =>
        res.json()
    ).then((res) => 
        window.open(res.link)
    )
}