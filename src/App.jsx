import React, { useState } from 'react';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';

export default function App() {
  const [userData,setUserData] = useState(null);
  return userData 
    ? <ChatRoom {...userData} onBack={()=>setUserData(null)}/>
    : <Home onJoin={setUserData}/>
}
