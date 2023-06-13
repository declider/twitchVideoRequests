let player
let skippers = []
let savers = []
let goal = 25

let skipWord = "Em"
let saveWord = "ok"

let queue = []
const queueEl = document.getElementById("queue")

let currentOrder = {
    user: "declider",
    link: "https://www.youtube.com/watch?v=x23I8f9PwlI",
    title: "Terraria Music - Day",
    yt_id: "x23I8f9PwlI"
}

const params = (new URL(document.location)).searchParams
const channel = params.get("channel") || "deciider"

ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    messageHandler(user, message.trim())
}

ComfyJS.Init( channel )


function createOrder(user, link, title, yt_id) {
    let order = {
        user: user,
        link: link,
        title: title,
        yt_id: yt_id
    }

    queue.push(order)

    let orderEl = document.createElement("div")
    orderEl.innerText = `${user} - ${title}`
    orderEl.className = "order"
    queueEl.appendChild(orderEl)

}


function updateSettings() {
    skipWord = document.getElementById("skipWord").value || "!skip"
    saveWord = document.getElementById("saveWord").value || "!save"
    goal = document.getElementById("goal").valueAsNumber || 25
    updateInfo()
}


function updateInfo() {
    document.getElementById("skipWordInfo").innerText = skipWord
    document.getElementById("saveWordInfo").innerText = saveWord
    document.getElementById("skipLengthInfo").innerText = skippers.length
    document.getElementById("saveLengthInfo").innerText = savers.length
    document.getElementById("currentInfo").innerText = skippers.length - savers.length
    document.getElementById("info").innerText = `${currentOrder.user} - ${currentOrder.title}`
}


function clearEverything() {
    skippers.length = 0
    savers.length = 0
    updateInfo()
}


async function getTitle(link) {
    const response = await fetch(`https://noembed.com/embed?dataType=json&url=${link}`)
    const result = await response.json()
    return result.title
}


function messageHandler(user, message) {
    let parts = message.split(" ")
    let command = parts[0] || undefined

    if (command=="видео") {
        let link = parts[1] || undefined
        if(!link) { return }
        
        let yt_id
        if(link.includes("watch?v=")) {
            yt_id = link.split("watch?v=")[1].split("&")[0]
        } else if (link.includes("youtu.be")) {
            yt_id = link.split(".be/")[1].split("&")[0]
        } else {
            return
        }
        
        if(!yt_id) { return }

        getTitle(link).then(title => {
            createOrder(user, link, title, yt_id)
        })


    } else if (command==skipWord) { // Скип
        if (skippers.includes(user)) {
            return
        } else if (savers.includes(user)) {
            let i = savers.indexOf(user)
            if (i!==-1) { savers.splice(i, 1) }
        }

        skippers.push(user)

        let current = skippers.length - savers.length
        console.log(current, goal)
        if (current >= goal) {
            skipVideo()
        }
        updateInfo()


    } else if (command==saveWord) {
        if (savers.includes(user)) {
            return
        } else if (skippers.includes(user)) {
            let i = skippers.indexOf(user)
            if (i!==-1) { skippers.splice(i, 1) }
        }
        
        savers.push(user)
        updateInfo()
    }
}


function skipVideo() {
    if(!queue.length) { return }
    currentOrder = queue.shift()
    queueEl.getElementsByClassName("order")[0].remove()
    player.loadVideoById(currentOrder.yt_id)
    clearEverything()
    updateInfo()
}


function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    height: '768',
    width: '1366',
    videoId: 'x23I8f9PwlI',
    playerVars: {
        rel: 0,
        start: 0,
        iv_load_policy: 3,
        autoplay: 0,
        playsinline: 1,
        origin: "https://www.youtube.com"
    },
    events: {   
        'onStateChange': onPlayerStateChange
    }
    })
}


function onPlayerStateChange(event) {
    if(event.data===0) {
        skipVideo()
    }
}

updateInfo()
