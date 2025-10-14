'use client';

import { useEffect, useState} from 'react';
import { useGigsStore } from '@/stores/useGigsStore';
import '../../styles/gigs-list.css';

export default function GigsList() {

  /*** VARIABLES ***/
  const { gigs, loading, fetchGigs } = useGigsStore();
  const fixedSortedGigs = gigs
    .filter((gig) => gig.status === 'fix')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  /*** FUNCTIONS/HANDLERS ***/
  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  /*** RENDER ***/
  if (loading) {
    return <div className="gigs-list-loading">Loading...</div>;
  }

  if (fixedSortedGigs.length === 0) {
    return <div className="gigs-list-empty">No gigs scheduled yet.</div>;
  }

  return (
    <ul className="gigs-list">
      {fixedSortedGigs.map((gig) => (
        <li key={gig.id} className="gigs-list-item">
          <div className="gigs-list-item-date">
            {new Date(gig.date).toLocaleDateString().replaceAll('/', '.')}
          </div>
          <div className="gigs-list-item-act gigs-list-item-desktop">{gig.act}</div>
          {gig.venue && (
            <div className="gigs-list-item-venue gigs-list-item-desktop">{gig.venue}</div>
          )}
          {gig.location && (
            <div className="gigs-list-item-location gigs-list-item-desktop">{gig.location}</div>
          )}
          <div className="gigs-list-item-info-row gigs-list-item-mobile">
            <div className="gigs-list-item-act">{gig.act}</div>
            {gig.venue && (
              <div className="gigs-list-item-venue">{gig.venue}</div>
            )}
            {gig.location && (
              <div className="gigs-list-item-location">{gig.location}</div>
            )}
          </div>
          {gig.comments && (
            <div className="gigs-list-item-comments">{gig.comments}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
