import React, { useMemo } from 'react';
import type { EventModel, EventDomain } from '../../types/event';
import { formatCurrency } from '../../utils/currency';
import {
  getVendorPipelineStats,
  getBudgetSummaryStats,
  getMilestoneSummaryStats,
  calculateReadinessScore,
} from '../../utils/eventSelectors';
import {
  CalendarDays,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  Briefcase,
  Sparkles,
  PieChart,
  Activity,
  Target,
  Zap,
  ListChecks,
  Plus,
  ChevronRight,
} from 'lucide-react';

interface DashboardOverviewProps {
  currentEvent: EventModel;
  activeDomain: EventDomain;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentEvent,
  activeDomain,
  onNavigate,
}) => {
  // === COMPUTED STATS VIA CANONICAL SINGLE SOURCE OF TRUTH ===
  const budgetStats = useMemo(() => {
    return getBudgetSummaryStats(currentEvent.totalBudget, currentEvent.budgetItems);
  }, [currentEvent.totalBudget, currentEvent.budgetItems]);

  const milestoneStats = useMemo(() => {
    return getMilestoneSummaryStats(currentEvent.macroMilestones, currentEvent.date);
  }, [currentEvent.macroMilestones, currentEvent.date]);

  const vendorStats = useMemo(() => {
    return getVendorPipelineStats(currentEvent.vendors);
  }, [currentEvent.vendors]);

  const readinessScore = useMemo(() => {
    return calculateReadinessScore(milestoneStats, vendorStats, budgetStats, currentEvent.runOfShow.length);
  }, [milestoneStats, vendorStats, budgetStats, currentEvent.runOfShow.length]);

  // Budget breakdown by category
  const budgetByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    currentEvent.budgetItems.forEach(item => {
      const cat = item.category || 'Other';
      map[cat] = (map[cat] || 0) + (item.actualCost || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [currentEvent.budgetItems]);

  const categoryColors = ['#38bdf8', '#ec4899', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

  // Recent activity (mock from real data)
  const recentActivity = useMemo(() => {
    const activities: Array<{ icon: React.ReactNode; text: string; time: string; color: string }> = [];
    
    currentEvent.budgetItems.slice(-3).reverse().forEach(item => {
      activities.push({
        icon: <Wallet size={14} />,
        text: `Budget item "${item.name}" — ${formatCurrency(item.actualCost || 0, currentEvent.currency)}`,
        time: item.isPaid ? 'Paid' : 'Pending',
        color: item.isPaid ? '#34d399' : '#fbbf24',
      });
    });

    currentEvent.vendors.slice(-2).reverse().forEach(v => {
      activities.push({
        icon: <Briefcase size={14} />,
        text: `Vendor "${v.name}" — ${v.status}`,
        time: v.category,
        color: '#a78bfa',
      });
    });

    currentEvent.macroMilestones.filter(m => m.isCompleted).slice(-2).reverse().forEach(m => {
      activities.push({
        icon: <CheckCircle2 size={14} />,
        text: `Milestone "${m.title}" completed`,
        time: 'Done',
        color: '#34d399',
      });
    });

    return activities.slice(0, 6);
  }, [currentEvent]);

  const domainEmoji = activeDomain === 'wedding' ? '💍' : activeDomain === 'birthday' ? '🎂' : '🤝';
  const domainLabel = activeDomain === 'wedding' ? 'Wedding' : activeDomain === 'birthday' ? 'Birthday' : 'Community';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* === WELCOME HEADER === */}
      <div
        className="glass-panel animate-fade-in-up"
        style={{
          padding: '1.5rem 2rem',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{domainEmoji}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '9999px', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {domainLabel} Dashboard
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '0.25rem 0 0', letterSpacing: '-0.02em' }}>
            {currentEvent.title}
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
            {currentEvent.tagline}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('budget')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'; }}
          >
            <Plus size={14} /> Add Budget Item
          </button>
          <button
            onClick={() => onNavigate('vendors')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#a78bfa', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.12)'; }}
          >
            <Briefcase size={14} /> Manage Vendors
          </button>
          <button
            onClick={() => onNavigate('ai-engine')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(236, 72, 153, 0.15))',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#fde68a', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <Sparkles size={14} /> AI Ideas
          </button>
        </div>
      </div>

      {/* === TOP STATS ROW === */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Countdown */}
        <div
          className="glass-panel card-hover-lift animate-fade-in-up stagger-1"
          style={{ padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          onClick={() => onNavigate('timeline')}
        >
          <div style={{ position: 'absolute', top: '8px', right: '10px', opacity: 0.06, fontSize: '3.5rem', fontWeight: 900 }}>⏱</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <CalendarDays size={14} color="#ec4899" /> Event Countdown
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: milestoneStats.daysRemaining <= 7 ? '#f87171' : '#f8fafc', marginTop: '0.35rem', lineHeight: 1 }}>
            {milestoneStats.daysRemaining}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>days remaining</div>
        </div>

        {/* Guest Count */}
        <div
          className="glass-panel card-hover-lift animate-fade-in-up stagger-2"
          style={{ padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          onClick={() => onNavigate('domain-hub')}
        >
          <div style={{ position: 'absolute', top: '8px', right: '10px', opacity: 0.06, fontSize: '3.5rem', fontWeight: 900 }}>👥</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Users size={14} color="#34d399" /> Total Guests
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.35rem', lineHeight: 1 }}>
            {currentEvent.guestCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>expected attendees</div>
        </div>

        {/* Readiness Score */}
        <div
          className="glass-panel card-hover-lift animate-fade-in-up stagger-3"
          style={{ padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '8px', right: '10px', opacity: 0.06, fontSize: '3.5rem', fontWeight: 900 }}>🎯</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Target size={14} color="#fbbf24" /> Readiness Score
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: readinessScore >= 70 ? '#34d399' : readinessScore >= 40 ? '#fbbf24' : '#f87171', marginTop: '0.35rem', lineHeight: 1 }}>
            {readinessScore}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
            {readinessScore >= 70 ? 'on track' : readinessScore >= 40 ? 'needs attention' : 'critical'}
          </div>
        </div>

        {/* Budget Spent */}
        <div
          className="glass-panel card-hover-lift animate-fade-in-up stagger-4"
          style={{ padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          onClick={() => onNavigate('budget')}
        >
          <div style={{ position: 'absolute', top: '8px', right: '10px', opacity: 0.06, fontSize: '3.5rem', fontWeight: 900 }}>💰</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Wallet size={14} color="#38bdf8" /> Budget Used
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: budgetStats.isCritical ? '#f87171' : '#f8fafc', marginTop: '0.35rem', lineHeight: 1 }}>
            {formatCurrency(budgetStats.spent, currentEvent.currency)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
            of {formatCurrency(budgetStats.total, currentEvent.currency)}
            {budgetStats.isCritical && <span style={{ color: '#f87171', fontWeight: 700 }}> • OVER BUDGET</span>}
          </div>
        </div>

        {/* Vendors */}
        <div
          className="glass-panel card-hover-lift animate-fade-in-up stagger-4"
          style={{ padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          onClick={() => onNavigate('vendors')}
        >
          <div style={{ position: 'absolute', top: '8px', right: '10px', opacity: 0.06, fontSize: '3.5rem', fontWeight: 900 }}>🤝</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Briefcase size={14} color="#a78bfa" /> Vendors
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', marginTop: '0.35rem', lineHeight: 1 }}>
            {vendorStats.total}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
            {vendorStats.confirmed + vendorStats.paid} confirmed
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT: Two column layout === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

        {/* LEFT: Budget Breakdown + Progress Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Budget Breakdown Visual */}
          <div
            className="glass-panel animate-fade-in-up"
            style={{ padding: '1.5rem', borderRadius: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={18} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Budget Breakdown</h3>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: 'none', border: 'none', color: '#38bdf8',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            {/* Horizontal Stacked Bar */}
            <div style={{ height: '28px', borderRadius: '14px', overflow: 'hidden', display: 'flex', marginBottom: '1rem', background: 'rgba(255,255,255,0.04)' }}>
              {budgetByCategory.map(([cat, amount], i) => {
                const widthPct = budgetStats.total > 0 ? (amount / budgetStats.total) * 100 : 0;
                if (widthPct < 1) return null;
                return (
                  <div
                    key={cat}
                    title={`${cat}: ${formatCurrency(amount, currentEvent.currency)}`}
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: categoryColors[i % categoryColors.length],
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      minWidth: '4px',
                      opacity: 0.85,
                    }}
                  />
                );
              })}
            </div>

            {/* Category Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
              {budgetByCategory.map(([cat, amount], i) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: categoryColors[i % categoryColors.length], flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{formatCurrency(amount, currentEvent.currency)}</span>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Remaining</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: budgetStats.remaining > 0 ? '#34d399' : '#f87171' }}>
                  {formatCurrency(budgetStats.remaining, currentEvent.currency)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Paid Items</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{budgetStats.paidItems}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Unpaid</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: budgetStats.unpaidItems > 0 ? '#fbbf24' : '#34d399' }}>{budgetStats.unpaidItems}</div>
              </div>
            </div>
          </div>

          {/* Milestone Progress + Vendor Pipeline side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Milestones */}
            <div
              className="glass-panel card-hover-lift animate-fade-in-up"
              style={{ padding: '1.25rem', borderRadius: '16px', cursor: 'pointer' }}
              onClick={() => onNavigate('timeline')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <ListChecks size={16} color="#ec4899" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Milestones</span>
              </div>

              {/* Circular Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle
                      cx="36" cy="36" r="30" fill="none"
                      stroke="#ec4899"
                      strokeWidth="6"
                      strokeDasharray={188.5}
                      strokeDashoffset={188.5 - (188.5 * milestoneStats.percent) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 36 36)"
                      style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                    />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                    {milestoneStats.percent}%
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>{milestoneStats.completed}/{milestoneStats.total}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{milestoneStats.pending} pending</div>
                </div>
              </div>

              {/* Mini milestone list */}
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {currentEvent.macroMilestones.slice(0, 4).map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <span style={{ color: m.isCompleted ? '#34d399' : '#475569' }}>
                      {m.isCompleted ? '✓' : '○'}
                    </span>
                    <span style={{ color: m.isCompleted ? '#94a3b8' : '#cbd5e1', textDecoration: m.isCompleted ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Pipeline */}
            <div
              className="glass-panel card-hover-lift animate-fade-in-up"
              style={{ padding: '1.25rem', borderRadius: '16px', cursor: 'pointer' }}
              onClick={() => onNavigate('vendors')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Briefcase size={16} color="#a78bfa" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Vendor Pipeline</span>
              </div>

              {/* Pipeline Stages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'Inquiry', count: vendorStats.inquiries, color: '#94a3b8', max: vendorStats.total },
                  { label: 'Confirmed', count: vendorStats.confirmed, color: '#818cf8', max: vendorStats.total },
                  { label: 'Fully Paid', count: vendorStats.paid, color: '#34d399', max: vendorStats.total },
                ].map(stage => (
                  <div key={stage.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: '#94a3b8' }}>{stage.label}</span>
                      <span style={{ color: '#f8fafc', fontWeight: 700 }}>{stage.count}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px',
                        background: stage.color,
                        width: `${stage.max > 0 ? (stage.count / stage.max) * 100 : 0}%`,
                        transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '0.75rem', padding: '0.6rem', borderRadius: '8px', background: 'rgba(168,85,250,0.06)', border: '1px solid rgba(168,85,250,0.15)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Contracts</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{formatCurrency(vendorStats.totalContract, currentEvent.currency)}</div>
              </div>
            </div>
          </div>

          {/* Timeline Overview */}
          <div
            className="glass-panel animate-fade-in-up"
            style={{ padding: '1.25rem', borderRadius: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#fbbf24" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Run of Show</h3>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Full Timeline <ChevronRight size={14} />
              </button>
            </div>

            {currentEvent.runOfShow.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.88rem' }}>No timeline entries yet</div>
                <button
                  onClick={() => onNavigate('timeline')}
                  style={{
                    marginTop: '0.75rem', padding: '0.45rem 1rem', borderRadius: '8px',
                    background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)',
                    color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                  Add Timeline Entry
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentEvent.runOfShow.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.65rem 0.85rem', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: entry.status === 'completed' ? 'rgba(52,211,153,0.12)' : entry.status === 'in-progress' ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${entry.status === 'completed' ? 'rgba(52,211,153,0.3)' : entry.status === 'in-progress' ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      color: entry.status === 'completed' ? '#34d399' : entry.status === 'in-progress' ? '#38bdf8' : '#64748b',
                    }}>
                      {entry.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{entry.time} • {entry.owner} • {entry.location}</div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                      borderRadius: '6px', textTransform: 'uppercase',
                      background: entry.status === 'completed' ? 'rgba(52,211,153,0.12)' : entry.status === 'in-progress' ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.05)',
                      color: entry.status === 'completed' ? '#34d399' : entry.status === 'in-progress' ? '#38bdf8' : '#94a3b8',
                      border: `1px solid ${entry.status === 'completed' ? 'rgba(52,211,153,0.2)' : entry.status === 'in-progress' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                      {entry.status?.replace('_', ' ') || 'scheduled'}
                    </span>
                  </div>
                ))}
                {currentEvent.runOfShow.length > 5 && (
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', padding: '0.35rem' }}>
                    + {currentEvent.runOfShow.length - 5} more entries
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Activity Feed + Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Event Info Card */}
          <div
            className="glass-panel animate-fade-in-up"
            style={{ padding: '1.25rem', borderRadius: '16px' }}
          >
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} color="#fbbf24" /> Event Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Date', value: currentEvent.date, icon: <CalendarDays size={14} color="#38bdf8" /> },
                { label: 'Location', value: currentEvent.location, icon: <Target size={14} color="#34d399" /> },
                { label: 'Guest Count', value: `${currentEvent.guestCount} guests`, icon: <Users size={14} color="#a78bfa" /> },
                { label: 'Currency', value: currentEvent.currency, icon: <Wallet size={14} color="#fbbf24" /> },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.7rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {row.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{row.label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div
            className="glass-panel animate-fade-in-up"
            style={{ padding: '1.25rem', borderRadius: '16px' }}
          >
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} color="#38bdf8" /> Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                No activity yet. Start planning!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentActivity.map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      padding: '0.55rem 0.65rem', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '7px',
                      background: `${act.color}15`,
                      border: `1px solid ${act.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: act.color, flexShrink: 0, marginTop: '1px',
                    }}>
                      {act.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {act.text}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div
            className="glass-panel animate-fade-in-up"
            style={{ padding: '1.25rem', borderRadius: '16px' }}
          >
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Quick Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { label: `${domainLabel} Hub`, tab: 'domain-hub', icon: <Sparkles size={14} />, color: '#d4af37' },
                { label: 'Budget Matrix', tab: 'budget', icon: <Wallet size={14} />, color: '#38bdf8' },
                { label: 'Timeline', tab: 'timeline', icon: <Clock size={14} />, color: '#ec4899' },
                { label: 'Vendor Board', tab: 'vendors', icon: <Briefcase size={14} />, color: '#a78bfa' },
                { label: 'AI Idea Engine', tab: 'ai-engine', icon: <Sparkles size={14} />, color: '#fbbf24' },
              ].map(item => (
                <button
                  key={item.tab}
                  onClick={() => onNavigate(item.tab)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = `${item.color}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                    {item.label}
                  </span>
                  <ChevronRight size={14} style={{ color: '#475569' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
