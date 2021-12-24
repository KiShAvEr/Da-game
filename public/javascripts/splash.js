let data = {
    completed: 0,
    ongoing: 0,
    fastest: 0
}

fetch([window.location.href, "data"].join(""))
.then(res => res.json())
.then(response =>  {
    data = response

    document.getElementById("completed").innerHTML = data.completed
    document.getElementById("ongoing").innerHTML = data.ongoing
    document.getElementById("fastest").innerHTML = data.fastest + " moves"
})



setInterval(() => {
    fetch([window.location.href, "data"].join(""))
    .then(res => res.json())
    .then(response =>  data = response)

    document.getElementById("completed").innerHTML = data.completed
    document.getElementById("ongoing").innerHTML = data.ongoing
    document.getElementById("fastest").innerHTML = data.fastest + " moves"
}, 3000)

document.getElementById("button").onclick = () => {
    window.location.href = [window.location.href, "board"].join("")
}