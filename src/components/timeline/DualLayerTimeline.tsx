import React, { useState, useMemo } from 'react';
import type { MacroMilestone, TimelineEntry, RunOfShowStatus } from '../../types/timeline';
import { useTimelineManager } from '../../hooks/useTimelineManager';
import { Badge, type BadgeVariant } from '../common/Badge';
import { RunOfShowModal } from './RunOfShowModal';
import {
  CalendarRange,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  MapPin,
  User,
  Timer,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DualTimelineProps {
  macroMilestones: MacroMilestone[];
  runOfShow: TimelineEntry[];
  eventDate?: string;
  domain?: 'wedding' | 'birthday' | 'community';
  onUpdateMilestones: (milestones: MacroMilestone[]) => void;
  onUpdateRunOfShow: (entries: TimelineEntry[]) => void;
}

const RUN_STATUS_VARIANTS: Record<RunOfShowStatus, { label: string; variant: BadgeVariant; next: RunOfShowStatus }> = {
  scheduled: { label: 'Scheduled', variant: 'neutral', next: 'in-progress' },
  'in-progress': { label: 'In Progress', variant: 'warning', next: 'completed' },
  completed: { label: 'Completed', variant: 'success', next: 'scheduled' },
  delayed: { label: 'Delayed', variant: 'danger', next: 'in-progress' },
};

const FILTER_TAGS = ['All', 'Ceremony', 'Logistics', 'Entertainment', 'Meal', 'Safety'];

export const DualLayerTimeline: React.FC<DualTimelineProps> = ({
  macroMilestones,
  runOfShow,
  eventDate = '2026-11-20',
  domain = 'wedding',
  onUpdateMilestones,
  onUpdateRunOfShow,
}) => {
  const [subTab, setSubTab] = useState<'macro' | 'micro'>('macro');
  const [activeFilterTag, setActiveFilterTag] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);

  const {
    sortedRunOfShow,
    conflicts,
    macroStats,
    toggleMilestone,
    generateAutoSchedule,
    addRunOfShowEntry,
    updateRunOfShowEntry,
    deleteRunOfShowEntry,
    setRunOfShowStatus,
  } = useTimelineManager({
    macroMilestones,
    runOfShow,
    eventDate,
    domain,
    onUpdateMilestones,
    onUpdateRunOfShow,
  });

  const handleToggleMilestone = (id: string, currentState: boolean) => {
    toggleMilestone(id);
    if (!currentState) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#d4af37', '#ec4899', '#6366f1', '#10b981'],
        });
      } catch {
        // Fallback
      }
    }
  };

  // Filtered micro run of show
  const filteredMicroEntries = useMemo(() => {
    if (activeFilterTag === 'All') return sortedRunOfShow;
    return sortedRunOfShow.filter((entry) => {
      const tagLower = activeFilterTag.toLowerCase();
      const milestoneLower = (entry.milestone || '').toLowerCase();
      const titleLower = (entry.title || '').toLowerCase();
      return milestoneLower.includes(tagLower) || titleLower.includes(tagLower);
    });
  }, [sortedRunOfShow, activeFilterTag]);

  return (
    <section
      aria-label="Dual-Layer Timeline Engine"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Top Navigation & Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Sub-tab Pill Switcher */}
          <div
            role="tablist"
            aria-label="Timeline Modes"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              padding: '0.3rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              role="tab"
              id="tab-macro"
              aria-selected={subTab === 'macro'}
              onClick={() => setSubTab('macro')}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: subTab === 'macro' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: subTab === 'macro' ? '#ffffff' : '#94a3b8',
                backgroundColor: subTab === 'macro' ? '#6366f1' : 'transparent',
                boxShadow: subTab === 'macro' ? '0 2px 10px rgba(99, 102, 241, 0.35)' : 'none',
              }}
            >
              <CalendarRange size={15} />
              <span>Macro Milestone Roadmap</span>
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                {macroStats.completed}/{macroStats.total}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-micro"
              aria-selected={subTab === 'micro'}
              onClick={() => setSubTab('micro')}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: subTab === 'micro' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: subTab === 'micro' ? '#ffffff' : '#94a3b8',
                backgroundColor: subTab === 'micro' ? '#6366f1' : 'transparent',
                boxShadow: subTab === 'micro' ? '0 2px 10px rgba(99, 102, 241, 0.35)' : 'none',
              }}
            >
              <Clock size={15} />
              <span>Micro Day-of Run-of-Show</span>
              {conflicts.length > 0 && (
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '9999px', backgroundColor: '#f59e0b', color: '#000000', fontWeight: 800 }}>
                  {conflicts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {subTab === 'macro' && (
            <button
              type="button"
              id="btn-auto-schedule"
              onClick={() => {
                generateAutoSchedule(eventDate, domain);
                try {
                  confetti({
                    particleCount: 45,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ['#38bdf8', '#818cf8', '#d4af37'],
                  });
                } catch {}
              }}
              aria-label="Auto-generate milestone schedule based on event date"
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '8px',
                color: '#e0e7ff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <span>⚡ Auto-Generate Schedule (T-90, T-60, T-30, T-7)</span>
            </button>
          )}

          {subTab === 'micro' && (
            <button
              type="button"
              id="btn-add-run-of-show"
              className="btn-primary-glow"
              onClick={() => {
                setEditingEntry(null);
                setIsModalOpen(true);
              }}
              style={{
                padding: '0.5rem 1.25rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Plus size={16} />
              <span>Add Schedule Entry</span>
            </button>
          )}
        </div>
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
            gap: '0.5rem',
            color: '#fcd34d',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span>{conflicts.length} CRITICAL TIMELINE OVERLAP / CONFLICT(S)</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
            {conflicts.map((c, i) => (
              <li key={i}>
                <strong>{c.conflictType.toUpperCase()}:</strong> {c.details}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 1. Macro Milestone Stepper Roadmap View */}
      {subTab === 'macro' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stepper Roadmap Line */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                  Execution Roadmap Stepper
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  Structured milestone checkpoints from 6 months out down to final day rehearsal.
                </p>
              </div>
              <Badge variant={macroStats.percent === 100 ? 'success' : 'primary'} size="md">
                {macroStats.completed} of {macroStats.total} Milestones Signed Off ({macroStats.percent}%)
              </Badge>
            </div>

            {/* Stepper Node Track */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                position: 'relative',
              }}
            >
              {macroMilestones.map((m, idx) => {
                return (
                  <article
                    key={m.id}
                    className={`card-hover-lift animate-fade-in-up stagger-${(idx % 6) + 1}`}
                    onClick={() => handleToggleMilestone(m.id, m.isCompleted)}
                    style={{
                      backgroundColor: m.isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '14px',
                      border: m.isCompleted
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>
                        Step {idx + 1} • {m.phase}
                      </span>
                      <button
                        type="button"
                        aria-label={`Mark milestone "${m.title}" as ${m.isCompleted ? 'incomplete' : 'complete'}`}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: m.isCompleted ? '#34d399' : '#64748b' }}
                      >
                        {m.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: m.isCompleted ? '#94a3b8' : '#f8fafc',
                        textDecoration: m.isCompleted ? 'line-through' : 'none',
                        margin: 0,
                      }}
                    >
                      {m.title}
                    </h4>

                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                      {m.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <span>Due: {m.dueDate}</span>
                      {m.priority === 'high' && (
                        <Badge variant="danger" size="sm">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Micro Day-of Run-of-Show Hourly Schedule View */}
      {subTab === 'micro' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filter Tags Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={13} /> Filter Tag:
            </span>
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveFilterTag(tag)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: activeFilterTag === tag ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: activeFilterTag === tag ? '#6366f1' : 'rgba(15, 23, 42, 0.6)',
                  color: activeFilterTag === tag ? '#ffffff' : '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: activeFilterTag === tag ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Minute-by-Minute Entry Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredMicroEntries.map((entry, idx) => {
              const statusCfg = RUN_STATUS_VARIANTS[entry.status] || RUN_STATUS_VARIANTS.scheduled;
              const isDone = entry.status === 'completed';

              return (
                <article
                  key={entry.id}
                  className={`glass-panel card-hover-lift animate-fade-in-up stagger-${(idx % 6) + 1}`}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  {/* Time Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '160px' }}>
                    <div
                      style={{
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                        {entry.time}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
                        <Timer size={10} /> {entry.durationMinutes}m
                      </div>
                    </div>

                    <div>
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: isDone ? '#94a3b8' : '#f8fafc',
                          textDecoration: isDone ? 'line-through' : 'none',
                          margin: 0,
                        }}
                      >
                        {entry.title}
                      </h4>
                      {entry.notes && (
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata: Location, Owner, Milestone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} color="#38bdf8" />
                      <span>{entry.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={13} color="#a78bfa" />
                      <span>{entry.owner}</span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {entry.milestone}
                    </Badge>
                  </div>

                  {/* Status Toggle & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRunOfShowStatus(entry.id, statusCfg.next)}
                      aria-label={`Cycle status from ${statusCfg.label}`}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <Badge variant={statusCfg.variant} size="md">
                        {statusCfg.label}
                      </Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingEntry(entry);
                        setIsModalOpen(true);
                      }}
                      aria-label={`Edit ${entry.title}`}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.35rem', color: '#cbd5e1', cursor: 'pointer' }}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRunOfShowEntry(entry.id)}
                      aria-label={`Delete ${entry.title}`}
                      style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '0.35rem', color: '#f87171', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Run of Show Modal */}
      <RunOfShowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(entryData) => {
          if (editingEntry) {
            updateRunOfShowEntry(editingEntry.id, entryData);
          } else {
            addRunOfShowEntry(entryData);
          }
        }}
        initialData={editingEntry}
      />
    </section>
  );
};
