const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// in-memory storage
const roomPassphrases = {};
const roomMessages = {}; // room -> [{ from, encrypted, timestamp }]

app.get('/', (req, res) => res.send('REST API server running'));

// Validate passphrase for a room
app.post('/api/validate', (req, res) => {
  const { room, passphrase } = req.body;
  if (!room || !passphrase) {
    return res.status(400).json({ success: false, message: 'Missing room or passphrase' });
  }

  if (!roomPassphrases[room]) {
    roomPassphrases[room] = passphrase;
    return res.json({ success: true });
  } else if (roomPassphrases[room] === passphrase) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: 'Incorrect passphrase for this room.' });
  }
});

// Post a message to a room
app.post('/api/message', (req, res) => {
  const { room, encrypted, from, timestamp } = req.body;
  if (!room || !encrypted) {
    return res.status(400).json({ error: 'Missing room or message' });
  }

  if (!roomMessages[room]) {
    roomMessages[room] = [];
  }

  roomMessages[room].push({ from, encrypted, timestamp });
  res.json({ success: true });
});

// Get messages for a room (polling endpoint)
app.get('/api/messages/:room', (req, res) => {
  const { room } = req.params;
  const messages = roomMessages[room] || [];
  res.json(messages);
});

// Clear old messages (optional cleanup)
app.delete('/api/messages/:room', (req, res) => {
  delete roomMessages[req.params.room];
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));