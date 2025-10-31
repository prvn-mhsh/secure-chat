const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;
    console.log(`${username} joined room ${room}`);
  });

  socket.on('chatMessage', ({ room, encrypted }) => {
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    socket.to(room).emit('chatMessage', { encrypted, from: socket.username, timestamp });
  });

  socket.on('disconnect', () => {
    console.log(`${socket.username || socket.id} disconnected`);
  });
});

http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
