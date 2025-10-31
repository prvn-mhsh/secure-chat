import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { encryptMessage, decryptMessage } from '../symbolVault';
import { motion } from 'framer-motion';

const socket = io('http://localhost:5000');

export default function ChatRoom({ username, room, passphrase, onBack }) {
  const [messages,setMessages] = useState([]);
  const [input,setInput] = useState('');
  const chatBox = useRef();

  useEffect(()=>{
    socket.emit('joinRoom',{username, room});
    socket.on('chatMessage', async ({encrypted, from, timestamp})=>{
      try{
        const decrypted = await decryptMessage(encrypted, passphrase);
        setMessages(msgs=>[...msgs,{from,text:decrypted,timestamp}]);
      }catch{
        setMessages(msgs=>[...msgs,{from,text:'[Failed to decrypt]',timestamp}]);
      }
    })
  },[]);

  useEffect(()=>{ chatBox.current.scrollTop = chatBox.current.scrollHeight },[messages]);

  const sendMessage = async ()=>{
    if(!input) return;
    const encrypted = await encryptMessage(input, passphrase);
    socket.emit('chatMessage',{room, encrypted});
    const timestamp = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    setMessages(msgs=>[...msgs,{from:username,text:input,timestamp}]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Room: {room}</h2>
        <button className="bg-red-500 px-4 py-2 rounded" onClick={onBack}>Back</button>
      </div>

      <div ref={chatBox} className="flex-1 bg-white/20 rounded p-4 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg,i)=>(
          <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`p-2 rounded ${msg.from===username?'self-end bg-green-500':'self-start bg-gray-700'}`}>
            <span className="font-bold">{msg.from}</span> [{msg.timestamp}]: {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input className="flex-1 p-2 rounded text-gray-900" value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message..." />
        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="bg-green-500 px-4 py-2 rounded" onClick={sendMessage}>Send</motion.button>
      </div>
    </div>
  )
}
