import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Home({ onJoin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [serverConnected, setServerConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const serverUrl = 'https://secure-chat-production.up.railway.app'; // Replace with your Railway URL

  // monitor server availability using fetch
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${serverUrl}/`);
        setServerConnected(res.ok);
      } catch {
        setServerConnected(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 3000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  const handleJoin = async () => {
    if (!serverConnected || !username || !room || !passphrase) return;
    setErrorMsg('');

    try {
      // validate passphrase via REST API
      const res = await fetch(`${serverUrl}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, passphrase })
      });
      const data = await res.json();
      if (data.success) {
        onJoin({ username, room, passphrase });
      } else {
        setErrorMsg(data.message || 'Failed to validate');
      }
    } catch (err) {
      setErrorMsg('Server error: ' + err.message);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <motion.h1 initial={{y:-50,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.8}} className="text-5xl font-bold mb-12">🔐 Secret Chat Vault</motion.h1>

      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{duration:0.8}} className="bg-white/20 p-10 rounded-3xl backdrop-blur-md flex flex-col gap-4 w-full max-w-md">
        <input type="text" placeholder="Your Name" value={username} onChange={e=>setUsername(e.target.value)} className="p-3 rounded text-gray-900"/>
        <input
          type="text"
          placeholder="Room ID (numbers only)"
          value={room}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '');
            setRoom(digits);
          }}
          className="p-3 rounded text-gray-900"
        />
        <input type="text" placeholder="Passphrase" value={passphrase} onChange={e=>setPassphrase(e.target.value)} className="p-3 rounded text-gray-900"/>
        <motion.button
          whileHover={{scale:serverConnected?1.05:1}}
          whileTap={{scale:serverConnected?0.95:1}}
          className="bg-green-500 p-3 rounded font-bold mt-2 disabled:opacity-50"
          onClick={handleJoin}
          disabled={!serverConnected || !username || !room || !passphrase}
        >
          {serverConnected ? 'Join Chat' : 'Connecting...'}
        </motion.button>
        {!serverConnected && <p className="text-sm text-yellow-100 mt-2">Unable to reach server, retrying...</p>}
        {errorMsg && <p className="text-sm text-red-300 mt-2">{errorMsg}</p>}
      </motion.div>
    </div>
  )
}
