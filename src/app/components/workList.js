'use client';

import { work } from './workData';
import '../../styles/work-list.css';
import Image from 'next/image';

export default function WorkList() {
  /*** RENDER ***/
  if (work.length === 0) {
    return <div className="work-list-empty">No work to display yet.</div>;
  }

  return (
    <ul className="work-list">
      {work.map((item) =>
       {
        const artist = item.artist ? `${item.artist} - ` : '';
        const artworkSrc = `/artworks/${item.title.toLowerCase().replaceAll(' ', '-')}.jpg`
        console.log(artworkSrc);
        return (
        <li key={item.id} className="work-list-item">
          <div className="work-list-item-subtitle">{item.year} - {item.type}</div>
          <div className="work-list-item-title"> {artist}{item.title}</div>
         <div className="worklist-image-and-description-wrapper">
          <Image src={artworkSrc} width={300} height={300} alt={item.title} className="work-list-item-artwork" />
          <div className="work-list-item-description"> {item.description} </div>
         </div>
            {item.link && ( <a href={item.link} target="_blank" rel="noopener noreferrer" className="work-list-item-link" > {item.link} </a> )}
        </li>
      )})}
    </ul>
  );
}