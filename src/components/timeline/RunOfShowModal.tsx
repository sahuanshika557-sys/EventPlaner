import React, { useState } from 'react';
import type { TimelineEntry, RunOfShowStatus } from '../../types/timeline';
import { Modal } from '../common/Modal';

interface RunOfShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<TimelineEntry, 'id'>) => void;
  initialData?: TimelineEntry | null;
}

export const RunOfShowModal: React.FC<RunOfShowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [time, setTime] = useState('09:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [location, setLocation] = useState('');
  const [milestone, setMilestone] = useState('');
  const [status, setStatus] = useState<RunOfShowStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [prevInitialData, setPrevInitialData] = useState<TimelineEntry | null | undefined>(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setTime(initialData.time);
      setDurationMinutes(initialData.durationMinutes || 30);
      setTitle(initialData.title);
      setOwner(initialData.owner);
      setLocation(initialData.location);
      setMilestone(initialData.milestone);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      setTime('09:00 AM');
      setDurationMinutes(30);
      setTitle('');
      setOwner('');
      setLocation('');
      setMilestone('');
      setStatus('scheduled');
      setNotes('');
    }
    setError(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Activity title is required.');
      return;
    }

    if (!time.trim()) {
      setError('Start time is required.');
      return;
    }

    onSubmit({
      time: time.trim(),
      durationMinutes: Math.max(5, durationMinutes),
      title: title.trim(),
      owner: owner.trim() || 'Lead Organizer',
      location: location.trim() || 'Main Hall',
      milestone: milestone.trim() || 'Event Milestone',
      status,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Run-of-Show Activity' : 'Add Minute-by-Minute Activity'}
      description="Micro run-of-show timing automatically coordinates owners and detects location clashes."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="ros-title"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
          >
            Activity / Milestone Title *
          </label>
          <input
            id="ros-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Grand Entrance & Toast, Cake Cutting, Sound Check"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#0f1322',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label
              htmlFor="ros-time"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Start Time (12h/24h) *
            </label>
            <input
              id="ros-time"
              type="text"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 02:30 PM or 14:30"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="ros-duration"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Duration (Minutes) *
            </label>
            <input
              id="ros-duration"
              type="number"
              min="5"
              step="5"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 5)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label
              htmlFor="ros-owner"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Owner / Lead Contact
            </label>
            <input
              id="ros-owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. DJ Pulse, Elena (MOH), Marcus"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="ros-location"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Location / Stage / Zone
            </label>
            <input
              id="ros-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Ballroom, Courtyard Garden"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label
              htmlFor="ros-milestone"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Milestone Tag
            </label>
            <input
              id="ros-milestone"
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder="e.g. Ceremony, Meal, Dance"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="ros-status"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Status
            </label>
            <select
              id="ros-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RunOfShowStatus)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="ros-notes"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
          >
            Technical Cues & Specific Notes
          </label>
          <textarea
            id="ros-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Music cues, microphone handoffs, lighting transitions"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#0f1322',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '0.65rem 1.5rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {initialData ? 'Update Activity' : 'Save Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
