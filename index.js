const express = require("express");
const app = express();
var cors = require('cors');
const Server = require('socket.io');

const userRouter = require("./routes/userRoute");
const GroupRouter = require("./routes/groupRoute");
const messageRouter = require('./routes/messageRoute');

const connectDb = require("../backend/db/db");
const {PORT} = require("./config/config");

const corsConfig = {
    origin: process.env.BASE_URL,
    credentials: true,
};

connectDb();

app.use(cors());
// Middleware for parsing JSON data
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use('/api/v1/group', GroupRouter);
app.use('/api/v1/message', messageRouter);

const server = app.listen(PORT, () => {
    console.log("Backend is connected to the port number", PORT);
});

const io = new Server.Server(server, {
    pingTimeout: 60000,
    // cors: {
    //     origin: 'http://localhost:4000',
    // },
});

io.on('connection', (socket) => {
    console.log("the socket is ",socket)
    socket.on('setup', (userData) => {
        console.log("user data is ", userData);
        socket.join(userData.id);
        socket.emit('connected');
    });
    socket.on('Group Created', (groupId) => {
        socket.join(groupId);
    });
    socket.on('typing', (groupId) => socket.in(groupId).emit('typing'));
    socket.on('stop typing', (groupId) => socket.in(groupId).emit('stop typing'));

    socket.on('new message', (newMessageRecieve) => {
        var group = newMessageRecieve.groupId;
        if (!group.users) console.log('group.users is not defined');
        group.users.forEach((user) => {
            if (user._id == newMessageRecieve.sender._id) return;
            socket.in(user._id).emit('message recieved', newMessageRecieve);
        });
    });
});
