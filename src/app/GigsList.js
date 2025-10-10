'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import '../styles/gigs-list.css';

export default function GigsList() {
  /*** VARIABLES ***/
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  /*** FUNCTIONS/HANDLERS ***/
  async function fetchGigs() {
    try {
      const res = await fetch('/api/gigs?status=fix');
      if (!res.ok) {
        throw new Error('Failed to fetch gigs');
      }
      const data = await res.json();
      setGigs(data.items || []);
    } catch (error) {
      toast.error('Failed to load gigs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGigs();
  }, []);

  /*** RENDER ***/
  if (loading) {
    return <div className="gigs-list-loading">Loading...</div>;
  }

  if (gigs.length === 0) {
    return <div className="gigs-list-empty">No gigs scheduled yet.</div>;
  }

  return (
    <ul className="gigs-list">
      {gigs.map((gig) => (
        <li key={gig.id} className="gigs-list-item">
          <div className="gigs-list-item-date">
            {new Date(gig.date).toLocaleDateString().replaceAll('/', '.')}
          </div>
          <div className="gigs-list-item-act">{gig.act}</div>
          {gig.venue && (
            <div className="gigs-list-item-venue">{gig.venue}</div>
          )}
          {gig.location && (
            <div className="gigs-list-item-location">{gig.location}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
