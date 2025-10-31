import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home({ onJoin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [passphrase, setPassphrase] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <motion.h1 initial={{y:-50,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.8}} className="text-5xl font-bold mb-12">🔐 Secret Chat Vault</motion.h1>

      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{duration:0.8}} className="bg-white/20 p-10 rounded-3xl backdrop-blur-md flex flex-col gap-4 w-full max-w-md">
        <input type="text" placeholder="Your Name" value={username} onChange={e=>setUsername(e.target.value)} className="p-3 rounded text-gray-900"/>
        <input type="text" placeholder="Room ID" value={room} onChange={e=>setRoom(e.target.value)} className="p-3 rounded text-gray-900"/>
        <input type="text" placeholder="Passphrase" value={passphrase} onChange={e=>setPassphrase(e.target.value)} className="p-3 rounded text-gray-900"/>
        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="bg-green-500 p-3 rounded font-bold mt-2" onClick={()=>{
          if(username && room && passphrase) onJoin({username, room, passphrase})
        }}>Join Chat</motion.button>
      </motion.div>
    </div>
  )
}
