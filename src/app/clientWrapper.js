'use client';

import {useState} from 'react';
import GigsList from './components/GigsList';
import WorkList from './components/workList';
import '../styles/page.css';
import Image from 'next/image';

export default function ClientWrapper() {

  // .1 States
  const [display, setDisplay] = useState('live');
  
  return (
    <div className="page">
      <header className="header">
        <div className="container">
        </div>
      </header>
      <main className="main">
        <Image src="/foto-achi.jpg" width={300} height={450} alt="Logo" className="foto-achi" />
        <div className="nav-bar">
        <button className="nav-option-btn" style={display === 'live' ? {textDecoration: 'underline'} : {}} onClick={() => setDisplay('live')}>live</button>
        <button className="nav-option-btn" style={display === 'work' ? {textDecoration: 'underline'} : {}} onClick={() => setDisplay('work')}>work</button>
        </div> 
        <div className="container">
          {display === 'live' && <GigsList />}
          {display === 'work' && <WorkList />}
        </div>
      </main>
      <footer className="footer"/>
    </div>
  );
}
