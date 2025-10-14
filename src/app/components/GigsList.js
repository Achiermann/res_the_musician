'use client';

import { useEffect, useState} from 'react';
import { useGigsStore } from '@/stores/useGigsStore';
import '../../styles/gigs-list.css';

export default function GigsList({ view }) {

  /*** VARIABLES ***/
  const { gigs, loading, fetchGigs } = useGigsStore();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fixedSortedGigs = gigs
    .filter((gig) => gig.status === 'fix' && new Date(gig.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastGigs = gigs
    .filter((gig) => gig.status === 'fix' && new Date(gig.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group past gigs by year
  const pastGigsByYear = pastGigs.reduce((acc, gig) => {
    const year = new Date(gig.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(gig);
    return acc;
  }, {});

  const years = Object.keys(pastGigsByYear).sort((a, b) => b - a);

  /*** FUNCTIONS/HANDLERS ***/
  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  /*** RENDER ***/
  if (loading) {
    return <div className="gigs-list-loading">Loading...</div>;
  }

  if (view === 'upcoming') {
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

  if (view === 'past') {
    if (pastGigs.length === 0) {
      return <div className="gigs-list-empty">No past concerts yet.</div>;
    }

    return (
      <div className="past-gigs-list">
        {years.map((year) => (
          <div key={year}>
            <h2 className="past-gigs-year">{year}</h2>
            <ul className="gigs-list">
              {pastGigsByYear[year].map((gig) => (
                <li key={gig.id} className="gigs-list-item past-show">
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
          </div>
        ))}
      </div>
    );
  }

  return null;
}
