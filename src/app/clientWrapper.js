'use client';

import {useState} from 'react';
import GigsList from './components/GigsList';
import WorkList from './components/workList';
import '../styles/page.css';
import Image from 'next/image';

export default function ClientWrapper() {

  // .1 States
  const [display, setDisplay] = useState('live');
  const [liveView, setLiveView] = useState('upcoming');

  return (
    <div className="page">
      <header className="header">
        <div className="container">
        </div>
      </header>
      <main className="main">
        <div className="image-stack">
          <Image src={display === 'work' ? "/foto-achi-2.jpg" : "/foto-achi.jpg"} width={300} height={450} alt="Logo" className="foto-achi" />
          <Image src={"/frame.png"} width={400} height={570} alt="Logo" className="foto-frame" />
        </div>
        <div className="nav-bar">
        <button className="nav-option-btn" style={display === 'live' ? {textDecoration: 'underline'} : {}} onClick={() => setDisplay('live')}>live</button>
        <button className="nav-option-btn" style={display === 'work' ? {textDecoration: 'underline'} : {}} onClick={() => setDisplay('work')}>work</button>
        </div>
        <div className="container">
          {display === 'live' && (
            <>
              <div className="live-view-toggle">
                <h2 className="live-view-toggle-option" style={liveView === 'upcoming' ? {textDecoration: 'underline', cursor: 'pointer'} : {cursor: 'pointer'}} onClick={() => setLiveView('upcoming')}>upcoming</h2>
                <h2 className="live-view-toggle-option" style={liveView === 'past' ? {textDecoration: 'underline', cursor: 'pointer'} : {cursor: 'pointer'}} onClick={() => setLiveView('past')}>past</h2>
              </div>
              <GigsList view={liveView} />
            </>
          )}
          {display === 'work' && <WorkList />}
        </div>
      </main>
      <footer className="footer"/>
    </div>
  );
}
