const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { router } = require('./routes/routes');
const { connectToDB } = require('./db/db');
const path = require('path');
const https = require('https');
const { Server } = require("socket.io");
const { Chats } = require('./models/models');
const { readFileSync } = require('fs');

const PORT = 443;
const HOST ='localhost';
const URL = 'mongodb+srv://amoghasdodawad:Amogh123@cluster0.mmjn3cr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"';
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/',router);
app.use(express.static('build'));
app.use((req, res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
        next();
    } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});

const credentials = {
    key : readFileSync('./certificates/server.key'),
    cert : readFileSync('./certificates/server.pem')
}
const server = https.createServer(credentials,app);
const users = {};

const io = new Server(server, {
    path: '/socket',
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
});

io
    .of('/sockets')
    .on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`);
        socket.on("join_room", (data) => {
            users[socket.id] = data.name;
            console.log(data.room);
            socket.join(data.room);
            Chats.find({room : data.room},{_id : 0, name : 1, message : 1})
                .then(result => {
                    console.log(result);
                    io.to(socket.id).emit('join_conf',result);
                })
                .catch(err => {
                    console.log(err);
                })
        });
  
        socket.on("send_message", (data) => {
        console.log(data);
        console.log('message  ',users[socket.id]);
        console.log(data.message);
        socket.to(data.room).emit("receive_message", data);
        const chat = new Chats({
            room : data.room,
            email : data.userEmail,
            message : data.message,
            name : data.name
        });
        chat.save()
            .then(()=>{
                console.log('Token');
            })
            .catch((err)=>{
                console.log(err);
            })
        });
  });

(async function (){
    await connectToDB(URL);
    console.log('Connected to sih2023 database');
    server.listen(PORT, HOST,function(){
        console.log(`Listening on port ${PORT}`);
    });
})();

