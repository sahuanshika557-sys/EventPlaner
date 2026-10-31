import React from 'react';
import type { MacroMilestone, MacroPhase } from '../../types/timeline';
import { Badge } from '../common/Badge';
import { CheckCircle2, Circle, Calendar, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MacroMilestonesProps {
  milestones: MacroMilestone[];
  onToggleMilestone: (id: string) => void;
  onDeleteMilestone: (id: string) => void;
}

const PHASES: { phase: MacroPhase; title: string; subtitle: string; color: string }[] = [
  { phase: '-6 months', title: 'Phase I: Vision & Contracting', subtitle: 'Venue lock, theme conception, key vendors', color: '#6366f1' },
  { phase: '-2 months', title: 'Phase II: Invites & Tastings', subtitle: 'Tastings, floral mockups, RSVP portal launch', color: '#0ea5e9' },
  { phase: '-2 weeks', title: 'Phase III: Headcounts & Staging', subtitle: 'Final banquet lock, seating arrangement, transport', color: '#f59e0b' },
  { phase: '-1 day', title: 'Phase IV: Rehearsal & Readiness', subtitle: 'Run-through, sound checks, vendor staging', color: '#ec4899' },
];

export const MacroMilestones: React.FC<MacroMilestonesProps> = ({
  milestones,
  onToggleMilestone,
}) => {
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleToggle = (id: string, currentState: boolean) => {
    onToggleMilestone(id);
    if (!currentState) {
      // Fire confetti celebration when completing a milestone
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#d4af37', '#6366f1', '#ec4899', '#10b981'],
        });
      } catch {
        // Safe fallback in environments without canvas
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Overall Milestone Progress */}
      <div
        style={{
          backgroundColor: 'rgba(26, 31, 48, 0.7)',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
              Macro Phase Milestone Tracker
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Structured countdown checkpoints (-6 months, -2 months, -2 weeks, -1 day)
            </p>
          </div>
          <Badge variant={progressPercent === 100 ? 'success' : 'primary'} size="md">
            {completedCount} of {milestones.length} Milestones Achieved ({progressPercent}%)
          </Badge>
        </div>

        {/* Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Macro milestone progress"
          style={{
            height: '10px',
            borderRadius: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 50%, #10b981 100%)',
              borderRadius: '5px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* 4 Macro Phases Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {PHASES.map((p) => {
          const phaseMilestones = milestones.filter((m) => m.phase === p.phase);
          const phaseCompleted = phaseMilestones.filter((m) => m.isCompleted).length;

          return (
            <article
              key={p.phase}
              style={{
                backgroundColor: 'rgba(26, 31, 48, 0.6)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Phase Header */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: p.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {p.phase}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {phaseCompleted}/{phaseMilestones.length}
                  </Badge>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                  {p.subtitle}
                </p>
              </div>

              {/* Milestones in this phase */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {phaseMilestones.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                    No milestones configured for this phase.
                  </p>
                ) : (
                  phaseMilestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggle(m.id, m.isCompleted)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        backgroundColor: m.isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 19, 34, 0.5)',
                        border: m.isCompleted
                          ? '1px solid rgba(16, 185, 129, 0.25)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`Mark milestone "${m.title}" as ${m.isCompleted ? 'incomplete' : 'completed'}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: m.isCompleted ? '#34d399' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          marginTop: '2px',
                        }}
                      >
                        {m.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: m.isCompleted ? '#94a3b8' : '#f8fafc',
                            textDecoration: m.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {m.title}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0' }}>
                          {m.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                            <Calendar size={11} /> {m.dueDate}
                          </span>
                          {m.priority === 'high' && (
                            <Badge variant="danger" size="sm" icon={<AlertCircle size={10} />}>
                              High Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
