const ws = new WebSocket("ws://localhost:3000");

const ROOT = document.getElementById('root');

const USERNAME_FORM_DOM = '<form id="username-form" autocomplete="off">' +
    '<input type="text" placeholder="Nom d\'utilisateur" id="username-input">' +
    '<button type="submit" id="submit-btn">START</button>' +
'</form>';

const WAITING_ROOM_DOM = '<div id="waiting-container"> Waiting Room </div>';

function bringToWaitingRoom() {
    ROOT.innerHTML = WAITING_ROOM_DOM;
}

function send (event, data) {
    ws.send(JSON.stringify({event, data}));
}

ws.addEventListener('open', () => {
    // USERNAME FORM
    ROOT.innerHTML = USERNAME_FORM_DOM;
    document.getElementById('username-form').addEventListener('submit', e => {
        e.preventDefault();
        const username_input = document.getElementById('username-input');

        send("username-update__server", username_input.value);
        username_input.value = null;
    });
});

ws.addEventListener('message', message => {
    const data = JSON.parse(message.data);
    switch (data.event) {
        case "username-accept__client":
            bringToWaitingRoom();
            break;
    }
});