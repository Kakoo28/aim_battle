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

function send(ws, event, data = null) {
    ws.send(JSON.stringify({event, data}));
}

wss.on("connection", ws => {

    ws.userID = uuid();
    console.log(' + ' + ws.userID);

});

server.listen(PORT, () => {
    console.log("Server is running on the port " + PORT);
})