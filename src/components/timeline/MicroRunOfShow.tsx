import React, { useState } from 'react';
import type { TimelineEntry, ScheduleConflict, RunOfShowStatus } from '../../types/timeline';
import { Badge, type BadgeVariant } from '../common/Badge';
import { RunOfShowModal } from './RunOfShowModal';
import {
  MapPin,
  User,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  Timer,
  AlertCircle,
} from 'lucide-react';

interface MicroRunOfShowProps {
  entries: TimelineEntry[];
  conflicts: ScheduleConflict[];
  onAddEntry: (entry: Omit<TimelineEntry, 'id'>) => void;
  onUpdateEntry: (id: string, updates: Partial<TimelineEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onSetStatus: (id: string, status: RunOfShowStatus) => void;
}

const STATUS_CONFIG: Record<RunOfShowStatus, { label: string; variant: BadgeVariant; next: RunOfShowStatus }> = {
  scheduled: { label: 'Scheduled', variant: 'neutral', next: 'in-progress' },
  'in-progress': { label: 'In Progress', variant: 'warning', next: 'completed' },
  completed: { label: 'Completed', variant: 'success', next: 'scheduled' },
  delayed: { label: 'Delayed', variant: 'danger', next: 'in-progress' },
};

export const MicroRunOfShow: React.FC<MicroRunOfShowProps> = ({
  entries,
  conflicts,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onSetStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner: Header & Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'rgba(26, 31, 48, 0.7)',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
            Micro Run-of-Show Minute-by-Minute Schedule
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Precision timeline with synchronized owners, locations, and real-time conflict detection.
          </p>
        </div>

        <button
          type="button"
          id="btn-add-run-of-show"
          onClick={handleOpenAdd}
          style={{
            padding: '0.55rem 1.25rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
          }}
        >
          <Plus size={16} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Conflicts & Overlap Alert Banner */}
      {conflicts.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            color: '#fcd34d',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span>{conflicts.length} SCHEDULE OVERLAP / CONFLICT(S) DETECTED</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {conflicts.map((c, idx) => (
              <li key={idx}>
                <strong>{c.conflictType.toUpperCase()}:</strong> {c.details}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Minute-by-Minute Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {entries.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: 'rgba(26, 31, 48, 0.4)',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              color: '#64748b',
            }}
          >
            No run-of-show activities scheduled yet. Click "Add Activity" above to create your minute-by-minute schedule.
          </div>
        ) : (
          entries.map((entry) => {
            const hasConflict = conflicts.some(
              (c) => c.entryId1 === entry.id || c.entryId2 === entry.id
            );
            const statusConfig = STATUS_CONFIG[entry.status] || STATUS_CONFIG.scheduled;

            return (
              <article
                key={entry.id}
                style={{
                  backgroundColor: 'rgba(26, 31, 48, 0.6)',
                  borderRadius: '14px',
                  border: hasConflict
                    ? '1px solid rgba(245, 158, 11, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  position: 'relative',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Time Badge Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '180px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#0f1322',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '10px',
                      minWidth: '100px',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                      {entry.time}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Timer size={11} /> {entry.durationMinutes} min
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                        {entry.title}
                      </h4>
                      {hasConflict && (
                        <Badge variant="warning" size="sm" icon={<AlertCircle size={10} />}>
                          Conflict
                        </Badge>
                      )}
                    </div>
                    {entry.notes && (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Column: Location, Owner, Milestone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} color="#38bdf8" />
                    <span>{entry.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={15} color="#a78bfa" />
                    <span>{entry.owner}</span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {entry.milestone}
                  </Badge>
                </div>

                {/* Actions & Status Cycle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => onSetStatus(entry.id, statusConfig.next)}
                    title="Click to cycle status"
                    aria-label={`Current status: ${statusConfig.label}. Click to cycle.`}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <Badge variant={statusConfig.variant} size="md">
                      {statusConfig.label}
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(entry)}
                    aria-label={`Edit ${entry.title}`}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '0.4rem',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    aria-label={`Delete ${entry.title}`}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      padding: '0.4rem',
                      color: '#f87171',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Add / Edit Run of Show Modal */}
      <RunOfShowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(entryData) => {
          if (editingEntry) {
            onUpdateEntry(editingEntry.id, entryData);
          } else {
            onAddEntry(entryData);
          }
        }}
        initialData={editingEntry}
      />
    </div>
  );
};
