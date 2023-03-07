const ws = new WebSocket('ws://localhost:3000');
const ROOT = document.getElementById('root');

const USERNAME_FORM_DOM = '<form id="username-form">' +
    '<input type="text" placeholder="Nom d\'utilisateur" id="username-input">' +
    '<button type="submit" id="submit-btn">START</button>' +
    '</form>';

const WAITING_ROOM_DOM = '<div id="waiting-container">' +
    '<div id="chat">' +
    '<div id="message-container"></div>' +
    '<form id="message-form">' +
    '<input type="text" placeholder="Enter votre message.." id="message-input">' +
    '<button type="submit" id="message-send-btn">Envoyer</button>' +
    '</form>' +
    '</div>' +
    '<div id="player-list"></div>' +
    '</div>';

function send(event, data) {
    ws.send(JSON.stringify({event, data}));
}

function init() {
    ROOT.innerHTML = USERNAME_FORM_DOM;
    document.getElementById('username-form').addEventListener('submit', (e) => {
        e.preventDefault();
        let username = document.getElementById('username-input').value;
        send("sendUsernameToServer", username);
    });
}

function gotoWaitingRoom() {
    ROOT.innerHTML = WAITING_ROOM_DOM;

    // MESSAGE FORM
    document.getElementById('message-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const MESSAGE_INPUT = document.getElementById('message-input');
        send("newMessageToServer", MESSAGE_INPUT.value);
        MESSAGE_INPUT.value = "";
    })
}

function serverMessage(message) {
    const {event, data} = JSON.parse(message.data);
    switch (event) {
        case "initClient":
            init();
            break;

        case "acceptUsernameToClient":
            gotoWaitingRoom();
            break;

        case "deniedUsernameToClient":
            document.querySelector('#username input[type="text"]').value = "";
            break;

        case "sendUserListToClient":
            const PLAYER_LIST = document.getElementById('player-list');

            PLAYER_LIST.innerHTML = "";
            for (const id in data.USER_LIST) {
                if (id !== data.clientId) {
                    document.getElementById('player-list').innerHTML += `<div class="player">
                <span class="player__username">${data.USER_LIST[id].username}</span> 
                <span class="player__status ${data.USER_LIST[id].status}">${data.USER_LIST[id].status === "waiting" ? "En Attente" : "En Jeu"}</span>
                ${data.USER_LIST[id].status === "waiting" ? "<button class='player__invite-btn'>Invite</button>" : ''}
            </div>`;
                }
            }
            break;

        case "newMessageToClient":

            // REFRESH SCROLL DONT WORK
            const message_container = document.getElementById('message-container');

            message_container.innerHTML += `<div class="message"><span class="message__author">${data.author}</span><p class="message__content">${data.content}</p></div>`;
            message_container.scrollTop = message_container.scrollHeight;
            break;

    }
}

ws.addEventListener('message', serverMessage);