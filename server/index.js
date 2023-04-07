const http = require('http');
const WebSocket = require('ws');
const express = require('express');

const {v4: uuid} = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../client'});
});

app.use('/static', express.static('../client/assets/'));

const USERS = [];

function send(ws, event, data = null) {
    ws.send(JSON.stringify({event, data}));
}

wss.on("connection", ws => {

    ws.userID = uuid();
    console.log(' [+] ' + ws.userID);
    
    ws.on("message", message => {
        try
        {
            const data = JSON.parse(message);

            switch (data.event) {
                case "username-update__server":
                    if (data.data.length < 12 && data.data.length > 0) {
                        ws.username = data.data;
                        console.log(' [~] ' + ws.userID + " => " + data.data);
                        send(ws, "username-accept__client", data.data);
                    } else {
                        console.log(' [x] ' + ws.userID + " x=x " + data.data);
                        send(ws, "username-denied__client", data.data);
                    }
                    break;
            }
        } 
        catch (err) 
        {
            console.log(err);
        }
    });
});

server.listen(PORT, () => {
    console.log("Server is running on the port " + PORT);
})