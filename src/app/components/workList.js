'use client';

import { work } from './workData';
import { useState } from 'react';
import '../../styles/work-list.css';
import Image from 'next/image';

export default function WorkList() {
  /*** VARIABLES ***/
const [displayedProject, setDisplayedProject] = useState(work[0]?.title || '');
const currentProject = work.find(item => item.title === displayedProject) || {};
const artists = [...new Set(work.map(item => item.artist))];
const artworkSrc = `/artworks/${currentProject.title.toLowerCase().replaceAll(' ', '-')}.jpg`;

console.log('currentProject', currentProject);

  /*** RENDER ***/
  if (work.length === 0) {
    return <div className="work-list-empty">No work to display yet.</div>;
  }

  return (
    //.2 WORKLIST SIDEBAR
    <ul className="work-list-and-display-wrapper">
    <div className="work-list-sidebar">
      {artists.map((artist) =>
        <div key={artist} className="sidebar-item-artist">
          <h2>{artist}</h2>
      {work.filter(item => item.artist === artist).map(project => (
         <div key={project.id} className="work-list-item">
          <div className="work-list-item-title" onClick={() => setDisplayedProject(project.title)}>{project.title}</div>
        </div>
      ))}
        </div>
      )}
    </div>
{/*//.2 WORK DISPLAY} */}
    <div className="work-display" >
      <h1>{currentProject.title}</h1>
      <h2>{currentProject.year} - {currentProject.type}</h2>
      <p>{currentProject.description}</p>
      {currentProject.bandcamp && <iframe style={{ border: 0, width: '100%', height: "100%"}} src={currentProject.bandcamp.src} seamless><a href={currentProject.bandcamp.href}></a></iframe>}
   {currentProject.spotify_src && <iframe data-testid="embed-iframe" style={{ borderRadius: '21px' }} src={currentProject.spotify_src} width="100%" height="352" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>}

    </div>
    </ul>
  );
}



      // {const artistName = item.artist ? `${item.artist} - ` : '';
      //  const artworkSrc = `/artworks/${item.title.toLowerCase().replaceAll(' ', '-')}.jpg`;
      // // item.artist !== work[index]?.artist &&
      // })}

// <div className="work-list-item-subtitle">{item.year} - {item.type}</div>
//           <div className="work-list-item-title"> {artist}{item.title}</div>
//          <div className="worklist-image-and-description-wrapper">
//           <Image src={artworkSrc} width={300} height={300} alt={item.title} className="work-list-item-artwork" />
//           <div className="work-list-item-description"> {item.description} </div>
//          </div>
//             {item.link && ( <a href={item.link} target="_blank" rel="noopener noreferrer" className="work-list-item-link" > {item.link} </a> )