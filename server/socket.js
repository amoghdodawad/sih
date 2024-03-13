const express = require('express');
const app = express();
const cors = require('cors');
const https = require('https');
const { Server } = require("socket.io");
const { connectToDB } = require("./db/db");
const { Chats } = require('./models/models');
const { readFileSync } = require('fs');

const PORT = 1001;
const HOST = '16.171.7.191';
const URL = 'mongodb+srv://amoghasdodawad:@cluster0.mmjn3cr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
app.use(cors());
const credentials = {
    key : readFileSync('./certificates/server.key'),
    cert : readFileSync('./certificates/server.pem')
}
const server = https.createServer(credentials,app);
const users = {};

const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("join_room", (data) => {
      users[socket.id] = data.name;
      console.log(data.room);
      socket.join(data.room);
      Chats.find({room : data.room},{_id : 0, name : 1, message : 1})
          .then(result => {
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
})();

server.listen(PORT, HOST, () => {
    console.log("SERVER IS RUNNING");
});