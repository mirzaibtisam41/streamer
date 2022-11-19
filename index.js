const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

app.use(cors());
app.get("/", (req, res) => res.send('Server running successfully'));

io.on('connection', socket => {
    socket.on('user-join', ({ roomID, peerID, name }) => {
        socket.join(roomID);
        socket.broadcast.to(roomID).emit('new-user', { peerID, name });
        socket.on('disconnect', () => {
            io.to(roomID).emit('user-left', peerID);
        });
    });
    socket.on('create-message', ({ roomID, message, sender, token }) => {
        io.to(roomID).emit('new-message', { message, sender, token });
    });
    socket.on('left-uesr', ({ roomID, peerID }) => {
        io.to(roomID).emit('user-left', peerID);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));