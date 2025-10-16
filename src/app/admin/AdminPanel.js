'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useGigsStore } from '@/stores/useGigsStore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/admin-panel.css';
import '../../styles/admin-calendar.css';

export default function AdminPanel() {
  /*** VARIABLES ***/
  const { gigs, loading, fetchGigs, addGig, updateGig, deleteGig } = useGigsStore();
  const [showNewGigForm, setShowNewGigForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedGig, setSelectedGig] = useState(null);
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

  function handleRowClick(gig) {
    setSelectedGig(gig);
  }

  function handleCloseModal() {
    setSelectedGig(null);
  }

  function handleModalFieldUpdate(field, value) {
    if (selectedGig) {
      handleUpdateGig(selectedGig.id, { ...selectedGig, [field]: value });
      setSelectedGig({ ...selectedGig, [field]: value });
    }
  }

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  /*** RENDER ***/
  if (loading) {
    return <div className="admin-panel-loading">Loading...</div>;
  }

  // Group gigs by year and month
  const sortedGigs = [...gigs].sort((a, b) => new Date(b.date) - new Date(a.date));

  const groupedGigs = [];
  let currentYear = null;
  let currentMonth = null;

  sortedGigs.forEach((gig) => {
    const gigDate = new Date(gig.date);
    const year = gigDate.getFullYear();
    const month = gigDate.toLocaleString('en-US', { month: 'long' });

    if (year !== currentYear) {
      groupedGigs.push({ type: 'year', value: year });
      currentYear = year;
      currentMonth = null;
    }

    if (month !== currentMonth) {
      groupedGigs.push({ type: 'month', value: month });
      currentMonth = month;
    }

    groupedGigs.push({ type: 'gig', data: gig });
  });

  /*** CALENDAR FUNCTIONS ***/
  function handleDateClick(date) {
    const formattedDate = date.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, date: formattedDate }));
    setShowNewGigForm(true);
  }

  function getTileContent({ date, view }) {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const gigsOnDate = gigs.filter((gig) => gig.date === dateString);

      if (gigsOnDate.length > 0) {
        return (
          <div className="admin-calendar-tile-content">
            {gigsOnDate.map((gig) => (
              <div key={gig.id} className="admin-calendar-gig-dot" title={gig.act} />
            ))}
          </div>
        );
      }
    }
    return null;
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

      <div className="admin-calendar-wrapper">
        <Calendar
          onClickDay={handleDateClick}
          tileContent={getTileContent}
        />
      </div>

      {showNewGigForm && (
        <>
          <div className="admin-panel-form-backdrop" onClick={() => setShowNewGigForm(false)} />
          <form className="admin-panel-form" onSubmit={handleCreateGig}>
          <div className="admin-panel-header">
            <h2>Create Gig</h2>
          </div>
          <button
            type="button"
            className="admin-panel-cancel-button"
            onClick={() => setShowNewGigForm(false)}
          >
            Cancel
          </button>
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
        </>
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
            {groupedGigs.map((item, index) => {
              if (item.type === 'year') {
                return (
                  <tr key={`year-${item.value}`} className="admin-panel-year-row">
                    <td colSpan="10">{item.value}</td>
                  </tr>
                );
              }
              if (item.type === 'month') {
                return (
                  <tr key={`month-${index}`} className="admin-panel-month-row">
                    <td colSpan="10">{item.value}</td>
                  </tr>
                );
              }
              const gig = item.data;
              return (
              <tr key={gig.id} onClick={() => handleRowClick(gig)} className="admin-panel-gig-row">
                <td className="admin-panel-date-cell">
                  {editingId === gig.id ? (
                    <input
                      type="date"
                      defaultValue={gig.date}
                      onBlur={(e) => handleFieldUpdate(gig.id, 'date', e.target.value)}
                    />
                  ) : (
                    <>
                      <span className="admin-panel-date-desktop">{new Date(gig.date).toLocaleDateString()}</span>
                      <span className="admin-panel-date-mobile">{new Date(gig.date).getDate()}.</span>
                    </>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedGig && (
        <div className="admin-panel-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-panel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-panel-modal-header">
              <h2>Edit Gig Details</h2>
              <button onClick={handleCloseModal} className="admin-panel-modal-close">&times;</button>
            </div>
            <div className="admin-panel-modal-content">
              <label>
                Act
                <input
                  type="text"
                  value={selectedGig.act}
                  onChange={(e) => handleModalFieldUpdate('act', e.target.value)}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={selectedGig.date}
                  onChange={(e) => handleModalFieldUpdate('date', e.target.value)}
                />
              </label>
              <label>
                Venue
                <input
                  type="text"
                  value={selectedGig.venue || ''}
                  onChange={(e) => handleModalFieldUpdate('venue', e.target.value)}
                />
              </label>
              <label>
                Location
                <input
                  type="text"
                  value={selectedGig.location || ''}
                  onChange={(e) => handleModalFieldUpdate('location', e.target.value)}
                />
              </label>
              <label>
                Start Time
                <input
                  type="time"
                  value={selectedGig.start || ''}
                  onChange={(e) => handleModalFieldUpdate('start', e.target.value)}
                />
              </label>
              <label>
                End Time
                <input
                  type="time"
                  value={selectedGig.end || ''}
                  onChange={(e) => handleModalFieldUpdate('end', e.target.value)}
                />
              </label>
              <label>
                URL
                <input
                  type="url"
                  value={selectedGig.url || ''}
                  onChange={(e) => handleModalFieldUpdate('url', e.target.value)}
                />
              </label>
              <label>
                Status
                <select
                  value={selectedGig.status}
                  onChange={(e) => handleModalFieldUpdate('status', e.target.value)}
                >
                  <option value="offen">Offen</option>
                  <option value="fix">Fix</option>
                </select>
              </label>
              <label>
                Comments
                <textarea
                  value={selectedGig.comments || ''}
                  onChange={(e) => handleModalFieldUpdate('comments', e.target.value)}
                  rows="4"
                />
              </label>
              <div className="admin-panel-modal-actions">
                <button onClick={() => handleDuplicateGig(selectedGig)} className="admin-panel-action-button">
                  Duplicate
                </button>
                <button onClick={() => { handleDeleteGig(selectedGig.id); handleCloseModal(); }} className="admin-panel-action-button-delete">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
