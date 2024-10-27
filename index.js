const express = require("express");
const app = express();
var cors = require('cors')
import * as Server from 'socket.io';

const connectDb = require("../backend/db/db")
const {PORT} = require("./config/config");

const corsConfig = {
    origin: process.env.BASE_URL,
    credentials: true,
};

connectDb ()

const mainRouter =require("./routes/index")

app.use(cors())
// Middleware for parsing JSON data
app.use(express.json());


app.use("/api/v1",mainRouter)

app.listen(PORT,()=>{
    console.log("Backend is connected to the port number",PORT)
})

const server = app.listen(PORT, () => {
    console.log(`Server Listening at PORT - ${PORT}`);
});

const io = new Server.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
    },
});

io.on('connection', (socket) => {
    socket.on('setup', (userData) => {
        console.lof("user data is ",userData)
        socket.join(userData.id);
        socket.emit('connected');
    });
    socket.on('join room', (room) => {
        socket.join(room);
    });
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
  
    socket.on('new message', (newMessageRecieve) => {
      var chat = newMessageRecieve.chatId;
      if (!chat.users) console.log('chats.users is not defined');
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieve.sender._id) return;
        socket.in(user._id).emit('message recieved', newMessageRecieve);
      });
    });

    
  });