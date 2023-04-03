const ws = new WebSocket("ws://localhost:3000");

const ROOT = document.getElementById('root');

function send (event, data) {
    ws.send(JSON.stringify({event, data}));
}

ws.addEventListener('open', () => {
    ROOT.innerText = "Vous êtes en liaison avec le serveur !";
});