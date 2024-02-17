let player
let skippers = []
let savers = []
let goal = 25

let skipWord = "Em"
let saveWord = "ok"

let queue = []
const queueEl = document.getElementById("queue")
const autoskipCheck = document.getElementById("autoskip")
const skipBtn = document.getElementById("skip")
const randomCheck = document.getElementById("random")


const params = (new URL(document.location)).searchParams
const channel = params.get("channel")
if (!channel) {
    alert("НЕ УКАЗАН ТВИЧ КАНАЛ (в ссылке добавить ?channel=КАНАЛ)")
}

let currentOrder = {
    user: "Кто прочитал",
    link: "https://www.youtube.com/watch?v=j5a0jTc9S10",
    title: "тот лох",
    yt_id: "j5a0jTc9S10"
}

ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    messageHandler(user, message.trim())
}

ComfyJS.Init( channel )

let templates = ["youtube.com/watch?v=", "youtu.be/", "youtube.com/shorts/"]


// В этом файле не используется, вызывается в html файле
function updateSettings() {
    skipWord = document.getElementById("skipWord").value || "!skip"
    saveWord = document.getElementById("saveWord").value || "!save"
    goal = document.getElementById("goal").valueAsNumber || 25
    updateInfo()
}


function updateInfo() {
    document.getElementById("skipWordInfo").innerText   = skipWord
    document.getElementById("saveWordInfo").innerText   = saveWord
    document.getElementById("skipLengthInfo").innerText = skippers.length
    document.getElementById("saveLengthInfo").innerText = savers.length
    document.getElementById("currentInfo").innerText    = skippers.length - savers.length
    document.getElementById("info").innerText           = `${currentOrder.user} - ${currentOrder.title}`
}


async function getTitle(link) {
    const response = await fetch(`https://noembed.com/embed?dataType=json&url=${link}`)
    const result = await response.json()
    return result.title
}


function messageHandler(user, message) {
    message = message.replace("  "," ").replace(/[\uD800-\uDFFF]/gi, []).trim() // Невидимые символы в 7tv и чаттерино
    let parts = message.split(" ")
    if (parts.length > 1) { return } // Если это не "скипы/сейвы" и не заказы
    let command = parts[0]

    if (templates.some((template) => message.includes(template))) {
        let link = command
        link = link.replace("/shorts/","/watch?v=")
        link = link.replace("youtu.be/","youtube.com/watch?v=")
        let yt_id = link.split("watch?v=")[1].split("&")[0]
        if(!yt_id) { return }

        if (queue.find((element) => element.yt_id === yt_id)) {
            return
        }

        getTitle(link).then(title => {
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
            orderEl.title = title
            orderEl.dataset.ytid = yt_id
            queueEl.appendChild(orderEl)
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
        if (current >= goal) {
            skipBtn.style.background = "rgb(44, 146, 86)"
            if (autoskipCheck.checked) {
                skipVideo()
            }
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
    if (randomCheck.checked) {
        let random = Math.floor(Math.random() * queue.length)
        currentOrder = queue[random]
        queue.splice(random, 1)
        let yt_id = currentOrder.yt_id
        queueEl.querySelector(`.order[data-ytid="${yt_id}"]`).remove()
    } else {
        currentOrder = queue.shift()
        queueEl.getElementsByClassName("order")[0].remove()
    }
    skipBtn.style.background = "rgb(55, 82, 83)"
    player.loadVideoById(currentOrder.yt_id)
    skippers.length = 0
    savers.length = 0
    updateInfo()
}


function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'j5a0jTc9S10',
        playerVars: {
            rel: 0,
            start: 0,
            iv_load_policy: 3,
            autoplay: 0,
            playsinline: 1,
            origin: window.location.origin
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
window.onbeforeunload = function() {
    return "о"
}
