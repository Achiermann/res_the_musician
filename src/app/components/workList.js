'use client';

import { work } from './workData';
import { useState } from 'react';
import '../../styles/work-list.css';
import Image from 'next/image';

export default function WorkList({ isSidebarVisible, toggleSidebar }) {
  /*** VARIABLES ***/
const [displayedProject, setDisplayedProject] = useState(work[0]?.title || '');
const currentProject = work.find(item => item.title === displayedProject) || {};
const artists = [...new Set(work.map(item => item.artist))];

console.log('currentProject', currentProject);

  /*** FUNCTIONS/HANDLERS ***/
  const handleProjectClick = (projectTitle) => {
    setDisplayedProject(projectTitle);
    toggleSidebar();
  };

  /*** RENDER ***/
  if (work.length === 0) {
    return <div className="work-list-empty">No work to display yet.</div>;
  }

  return (
    //.2 WORKLIST SIDEBAR
    <ul className="work-list-and-display-wrapper">
    <div className={`work-list-sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
      {artists.map((artist) =>
        <div key={artist} className="sidebar-item-artist">
          <h2>{artist}</h2>
      {work.filter(item => item.artist === artist).map(project => (
         <div key={project.id} className="work-list-item">
          <div className="work-list-item-title" onClick={() => handleProjectClick(project.title)}>{project.title}</div>
        </div>
      ))}
        </div>
      )}
    </div>
{/*//.2 WORK DISPLAY} */}
    <div className={`work-display ${isSidebarVisible ? 'hidden' : 'visible'}`} >
      <h1>{currentProject.title}</h1>
      <h2>{currentProject.year} - {currentProject.type}</h2>
      <p>{currentProject.description}</p>
      {currentProject.bandcamp && <iframe style={{ border: 0, width: '100%', height: "100%"}} src={currentProject.bandcamp.src} seamless><a href={currentProject.bandcamp.href}></a></iframe>}
   {currentProject.spotify_src && <iframe data-testid="embed-iframe" style={{ borderRadius: '21px' }} src={currentProject.spotify_src} width="100%" height="352" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>}

    </div>
    </ul>
  );
}
