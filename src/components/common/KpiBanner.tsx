import React, { useMemo } from 'react';
import type { EventModel } from '../../types/event';
import { formatCurrency } from '../../utils/currency';
import { Badge } from './Badge';
import {
  getVendorPipelineStats,
  getBudgetSummaryStats,
  getMilestoneSummaryStats,
  calculateReadinessScore,
} from '../../utils/eventSelectors';
import {
  Wallet,
  CalendarClock,
  Briefcase,
  Gauge,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface KpiBannerProps {
  currentEvent: EventModel;
}

export const KpiBanner: React.FC<KpiBannerProps> = ({ currentEvent }) => {
  // 1. Budget Health Calculation (Canonical Single Source of Truth)
  const budgetStats = useMemo(() => {
    return getBudgetSummaryStats(currentEvent.totalBudget, currentEvent.budgetItems);
  }, [currentEvent.totalBudget, currentEvent.budgetItems]);

  // 2. Milestone Velocity & Countdown
  const milestoneStats = useMemo(() => {
    return getMilestoneSummaryStats(currentEvent.macroMilestones, currentEvent.date);
  }, [currentEvent.macroMilestones, currentEvent.date]);

  // 3. Vendor Pipeline
  const vendorStats = useMemo(() => {
    return getVendorPipelineStats(currentEvent.vendors);
  }, [currentEvent.vendors]);

  // 4. Key Readiness Score (Weighted aggregate readiness)
  const readinessScore = useMemo(() => {
    return calculateReadinessScore(milestoneStats, vendorStats, budgetStats, currentEvent.runOfShow.length);
  }, [milestoneStats, vendorStats, budgetStats, currentEvent.runOfShow.length]);

  return (
    <section
      aria-label="Real-Time Event KPI Analytics"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      {/* 1. Budget Health Card with Circular SVG Meter */}
      <article
        className="glass-panel card-hover-lift animate-fade-in-up stagger-1"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Wallet size={15} color="#38bdf8" />
            <span>Budget Health</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: budgetStats.isCritical ? '#f87171' : '#f8fafc' }}>
              {formatCurrency(budgetStats.spent, currentEvent.currency)}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Cap: {formatCurrency(budgetStats.total, currentEvent.currency)}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            {budgetStats.isCritical ? (
              <Badge variant="danger" size="sm" icon={<AlertTriangle size={11} />}>
                Over Budget
              </Badge>
            ) : budgetStats.isWarning ? (
              <Badge variant="warning" size="sm" icon={<AlertTriangle size={11} />}>
                90% Consumed
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                Healthy ({budgetStats.percent}%)
              </Badge>
            )}
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="5"
            />
            <circle
              className="smooth-gauge-ring"
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke={budgetStats.isCritical ? '#ef4444' : budgetStats.isWarning ? '#f59e0b' : '#38bdf8'}
              strokeWidth="5"
              strokeDasharray={163.3}
              strokeDashoffset={163.3 - (163.3 * budgetStats.percent) / 100}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ transition: 'stroke-dashoffset 0.85s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease' }}
            />
          </svg>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#f8fafc',
            }}
          >
            {budgetStats.percent}%
          </span>
        </div>
      </article>

      {/* 2. Milestone Velocity & Countdown Timer */}
      <article
        className="glass-panel card-hover-lift animate-fade-in-up stagger-2"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <CalendarClock size={15} color="#ec4899" />
            <span>Milestone Velocity</span>
          </div>
          <Badge variant="gold" size="sm">
            {milestoneStats.daysRemaining}d to go
          </Badge>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
            {milestoneStats.completed} / {milestoneStats.total}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Key checkpoints signed off • {milestoneStats.pending} pending
          </div>
        </div>

        {/* Micro Sparkline Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={milestoneStats.completed}
          aria-valuemin={0}
          aria-valuemax={milestoneStats.total}
          aria-label="Milestone velocity progress"
          style={{
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginTop: '0.75rem',
          }}
        >
          <div
            className="smooth-progress-bar"
            style={{
              height: '100%',
              width: `${milestoneStats.total > 0 ? (milestoneStats.completed / milestoneStats.total) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
              borderRadius: '9999px',
              transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </article>

      {/* 3. Vendor Pipeline Board */}
      <article
        className="glass-panel card-hover-lift animate-fade-in-up stagger-3"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Briefcase size={15} color="#a78bfa" />
          <span>Vendor Pipeline</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94a3b8' }}>{vendorStats.inquiries}</span>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Inquiry</div>
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '1.25rem' }}>›</div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>{vendorStats.confirmed}</span>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Confirmed</div>
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '1.25rem' }}>›</div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{vendorStats.paid}</span>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Paid</div>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
          {vendorStats.total} total vendor partners engaged
        </div>
      </article>

      {/* 4. Key Readiness Score */}
      <article
        className="glass-panel card-hover-lift animate-fade-in-up stagger-4"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Gauge size={15} color="#10b981" />
            <span>Readiness Score</span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem', transition: 'color 0.3s ease' }}>
            {readinessScore}%
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Calculated across milestones, vendors & budget
          </div>
        </div>

        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          <CheckCircle2 size={24} />
        </div>
      </article>
    </section>
  );
};
