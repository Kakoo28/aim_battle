const http = require('http');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const {v4: uuid} = require('uuid');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../client'});
});
app.use('/static', express.static('../client/assets/'));

const USERS = {};

function send(ws, event, data = null) { // SEND MESSAGE TO CLIENT
    ws.send(JSON.stringify({event, data}));
}

wss.on("connection", ws => {
    // INIT USER
    ws.id = uuid();
    USERS[ws.id] = ws;
    send(ws, "initClient");
    console.log(' +', ws.id);

    // LISTEN CLIENT MESSAGES
    ws.on("message", message => {
        try {
            const {event, data} = JSON.parse(message);

            switch (event) {
                case "sendUsernameToServer":
                    if (data.length > 1 && data.length < 12) {
                        send(ws, "acceptUsernameToClient", data);
                        ws.username = data;
                        ws.status = 'waiting';
                        updatePlayerList();
                    } else {
                        send(ws, "deniedUsernameToClient");
                    }
                    break;

                case "newMessageToServer":
                    if (data && data !== "") {
                        for (const id in USERS) {
                            if (USERS[id].username) {
                                send(USERS[id], "newMessageToClient", {author: ws.username, content: data});
                            }
                        }
                    }
                    break;
            }

        } catch (error) {
            console.log('[ERROR] Something went wrong with the message => ', error);
        }
    });

    ws.on("close", () => {
        console.log(' -', ws.username ? ws.username : ws.id);
        delete USERS[ws.id];
        updatePlayerList();
    });
});

function updatePlayerList() {
    // CREATE USER LIST
    const USER_LIST = {USER_LIST: {}};
    for (const id in USERS) {
        if (USERS[id].username) USER_LIST.USER_LIST[id] = {username: USERS[id].username, status: USERS[id].status};
    }

    // SENDING USER LIST TO EACH CLIENT WHO ARE WAITING
    for (const id in USERS) {
        if (USERS[id].status === "waiting") {
            USER_LIST.clientId = id;
            send(USERS[id], "sendUserListToClient", USER_LIST);
        }
    }
}

server.listen(PORT, () => {
    console.log('Server is running on port:', PORT);
});