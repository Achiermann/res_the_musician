'use client';

import { work } from './workData';
import '../../styles/work-list.css';

export default function WorkList() {
  /*** RENDER ***/
  if (work.length === 0) {
    return <div className="work-list-empty">No work to display yet.</div>;
  }

  return (
    <ul className="work-list">
      {work.map((item) =>
       {
        return (
        <li key={item.id} className="work-list-item">
          <div className="work-list-item-year">{item.year} </div>
          <div className="work-list-item-artist">{item.artist} </div>
          <div className="work-list-item-title">{item.title} </div>
          <div className="work-list-item-type">{item.type} </div>

          <div className="work-list-item-details">
            <div className="work-list-item-description">
              {item.description}
            </div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="work-list-item-link"
              >
                {item.link}
              </a>
            )}
          </div>
        </li>
      )})}
    </ul>
  );
}