import React, { useEffect, useState, useRef } from 'react';
import { encryptMessage, decryptMessage } from '../symbolVault';
import { motion } from 'framer-motion';

export default function ChatRoom({ username, room, passphrase, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatBox = useRef();
  const [lastPoll, setLastPoll] = useState(0);
  const serverUrl = 'https://secure-chat-production.up.railway.app/'; // Replace with your Railway URL
  // Poll for messages every 2 seconds
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const res = await fetch(`${serverUrl}/api/messages/${room}`);
        const allMessages = await res.json();
        
        // Only add new messages since last poll
        const newMsgs = allMessages.slice(lastPoll);
        for (const msg of newMsgs) {
          try {
            const decrypted = await decryptMessage(msg.encrypted, passphrase);
            setMessages(msgs => [...msgs, { from: msg.from, text: decrypted, timestamp: msg.timestamp }]);
          } catch {
            setMessages(msgs => [...msgs, { from: msg.from, text: '[Failed to decrypt]', timestamp: msg.timestamp }]);
          }
        }
        setLastPoll(allMessages.length);
      } catch (err) {
        console.error('Failed to poll messages:', err);
      }
    };

    const interval = setInterval(pollMessages, 2000);
    pollMessages(); // poll immediately on mount
    return () => clearInterval(interval);
  }, [room, passphrase, lastPoll, serverUrl]);

  useEffect(() => {
    if (chatBox.current) {
      chatBox.current.scrollTop = chatBox.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;
    try {
      const encrypted = await encryptMessage(input, passphrase);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Send message to server
      await fetch(`${serverUrl}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, encrypted, from: username, timestamp })
      });
      
      // Add to local messages immediately
      setMessages(msgs => [...msgs, { from: username, text: input, timestamp }]);
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleBack = async () => {
    try {
      // Optionally clean up the room on server
      await fetch(`${serverUrl}/api/messages/${room}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clean up room:', err);
    }
    onBack();
  };
  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Room: {room}</h2>
        <button className="bg-red-500 px-4 py-2 rounded" onClick={handleBack}>Back</button>
      </div>

      <div ref={chatBox} className="flex-1 bg-white/20 rounded p-4 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-2 rounded ${msg.from === username ? 'self-end bg-green-500 text-right' : 'self-start bg-gray-700 text-left'}`}
          >
            <span className="font-bold">{msg.from}</span> [{msg.timestamp}]: {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 p-2 rounded text-gray-900"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-500 px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}
