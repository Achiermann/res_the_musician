'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGigsStore } from '@/stores/useGigsStore';
import '../../styles/admin-panel.css';

export default function AdminPanel() {
  /*** VARIABLES ***/
  const { gigs, loading, fetchGigs, addGig, updateGig, deleteGig } = useGigsStore();
  const [showNewGigForm, setShowNewGigForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    act: '',
    date: '',
    venue: '',
    location: '',
    comments: '',
    status: 'offen',
    start: '18:00',
    end: '23:30',
    url: '',
  });

  /*** FUNCTIONS/HANDLERS ***/

  async function handleCreateGig(e) {
    e.preventDefault();

    if (!formData.act || !formData.date) {
      toast.error('Act and date are required');
      return;
    }

    try {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create gig');
      }

      const newGig = await res.json();
      addGig(newGig);
      toast.success('Gig created successfully');
      setShowNewGigForm(false);
      setFormData({
        act: '',
        date: '',
        venue: '',
        location: '',
        comments: '',
        status: 'offen',
        start: '18:00',
        end: '23:30',
        url: '',
      });
    } catch (error) {
      toast.error('Failed to create gig');
      console.error(error);
    }
  }

  async function handleUpdateGig(id, updatedData) {
    try {
      const res = await fetch(`/api/gigs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        throw new Error('Failed to update gig');
      }

      const updated = await res.json();
      updateGig(id, updated);
      toast.success('Gig updated successfully');
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to update gig');
      console.error(error);
    }
  }

  async function handleDeleteGig(id) {
    if (!confirm('Are you sure you want to delete this gig?')) {
      return;
    }

    try {
      const res = await fetch(`/api/gigs/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete gig');
      }

      deleteGig(id);
      toast.success('Gig deleted successfully');
    } catch (error) {
      toast.error('Failed to delete gig');
      console.error(error);
    }
  }

  async function handleDuplicateGig(gig) {
    try {
      const { id, ...gigData } = gig;
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gigData),
      });

      if (!res.ok) {
        throw new Error('Failed to duplicate gig');
      }

      const newGig = await res.json();
      addGig(newGig);
      toast.success('Gig duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate gig');
      console.error(error);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditClick(gig) {
    setEditingId(gig.id);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleFieldUpdate(id, field, value) {
    const gig = gigs.find((g) => g.id === id);
    if (gig) {
      handleUpdateGig(id, { ...gig, [field]: value });
    }
  }

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  /*** RENDER ***/
  if (loading) {
    return <div className="admin-panel-loading">Loading...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <button
          className="admin-panel-new-button"
          onClick={() => setShowNewGigForm(!showNewGigForm)}
        >
          {showNewGigForm ? 'Cancel' : 'New Gig'}
        </button>
      </div>

      {showNewGigForm && (
        <form className="admin-panel-form" onSubmit={handleCreateGig}>
          <div className="admin-panel-form-row">
            <label> Act <span className="admin-panel-form-required">*</span> <input type="text" name="act" value={formData.act} onChange={handleInputChange} required /> </label>
            <label> Date <span className="admin-panel-form-required">*</span> <input type="date" name="date" value={formData.date} onChange={handleInputChange} required /> </label>
          </div>
          <div className="admin-panel-form-row">
            <label> Venue <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} /> </label>
            <label> Location <input type="text" name="location" value={formData.location} onChange={handleInputChange} /> </label>
          </div>
          <div className="admin-panel-form-row">
            <label> Start Time <input type="time" name="start" value={formData.start} onChange={handleInputChange} /> </label>
            <label> End Time <input type="time" name="end" value={formData.end} onChange={handleInputChange} /> </label>
          </div>
          <div className="admin-panel-form-row">
            <label> URL <input type="url" name="url" value={formData.url} onChange={handleInputChange} /> </label>
          </div>
          <div className="admin-panel-form-row">
            <label> Status <select name="status" value={formData.status} onChange={handleInputChange}> <option value="offen">Offen</option> <option value="fix">Fix</option> </select> </label> </div>
          <div className="admin-panel-form-row">
            <label> Comments <textarea name="comments" value={formData.comments} onChange={handleInputChange} rows="3" /> </label>
          </div>
          <button type="submit" className="admin-panel-form-submit">
            Create Gig
          </button>
        </form>
      )}

      <div className="admin-panel-table-wrapper">
        <table className="admin-panel-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Act</th>
              <th>Venue</th>
              <th>Location</th>
              <th>Start</th>
              <th>End</th>
              <th>URL</th>
              <th>Status</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gigs.length === 0 && (
              <tr>
                <td colSpan="10" className="admin-panel-table-empty">
                  No gigs yet. Create one!
                </td>
              </tr>
            )}
            {gigs.map((gig) => (
              <tr key={gig.id}>
                <td>
                  {editingId === gig.id ? (
                    <input
                      type="date"
                      defaultValue={gig.date}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'date', e.target.value)}
                    />
                  ) : (
                    new Date(gig.date).toLocaleDateString()
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <input
                      type="text"
                      defaultValue={gig.act}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'act', e.target.value)}
                    />
                  ) : (
                    gig.act
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <input
                      type="text"
                      defaultValue={gig.venue}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'venue', e.target.value)}
                    />
                  ) : (
                    gig.venue
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <input
                      type="text"
                      defaultValue={gig.location}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'location', e.target.value)}
                    />
                  ) : (
                    gig.location
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <input
                      type="time"
                      defaultValue={gig.start}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'start', e.target.value)}
                    />
                  ) : (
                    gig.start
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <input
                      type="time"
                      defaultValue={gig.end}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'end', e.target.value)}
                    />
                  ) : (
                    gig.end
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <input
                      type="url"
                      defaultValue={gig.url}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'url', e.target.value)}
                    />
                  ) : (
                    gig.url ? <a href={gig.url} target="_blank" rel="noopener noreferrer">{gig.url}</a> : ''
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <select
                      defaultValue={gig.status}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'status', e.target.value)}
                    >
                      <option value="offen">Offen</option>
                      <option value="fix">Fix</option>
                    </select>
                  ) : (
                    <span className={`admin-panel-status-${gig.status}`}>
                      {gig.status}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === gig.id ? (
                    <textarea
                      defaultValue={gig.comments}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'comments', e.target.value)}
                      rows="2"
                    />
                  ) : (
                    gig.comments
                  )}
                </td>
                <td>
                  <div className="admin-panel-actions">
                    {editingId === gig.id ? (
                      <button
                        className="admin-panel-action-button"
                        onClick={handleCancelEdit}
                      >
                        Done
                      </button>
                    ) : (
                      <button
                        className="admin-panel-action-button"
                        onClick={() => handleEditClick(gig)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="admin-panel-action-button"
                      onClick={() => handleDuplicateGig(gig)}
                    >
                      Duplicate
                    </button>
                    <button
                      className="admin-panel-action-button-delete"
                      onClick={() => handleDeleteGig(gig.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
