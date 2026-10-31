import React, { useState, useEffect } from 'react';
import type { EventDomain, EventModel } from '../../types/event';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { BrandLogo } from './BrandLogo';
import {
  Search,
  Plus,
  SunMoon,
  Bell,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  Sparkles,
  Bot,
  Share2,
} from 'lucide-react';

interface NavbarProps {
  currentEvent: EventModel;
  activeDomain: EventDomain;
  onSwitchDomain: (domain: EventDomain) => void;
  onResetDefaults: () => void;
  hasBudgetAlert?: boolean;
  timelineConflictCount?: number;
  onQuickAddItem?: (type: 'budget' | 'timeline' | 'vendor') => void;
  onOpenOnboarding?: () => void;
  onOpenAssistant?: () => void;
  onOpenShareablePlan?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentEvent,
  activeDomain,
  onSwitchDomain,
  onResetDefaults,
  hasBudgetAlert = false,
  timelineConflictCount = 0,
  onQuickAddItem,
  onOpenOnboarding,
  onOpenAssistant,
  onOpenShareablePlan,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      return next;
    });
  };

  const handleExportCSV = () => {
    // Generate simple CSV of budget and vendors
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Category,Name,Cost,Paid\n';
    currentEvent.budgetItems.forEach((b) => {
      csvContent += `"${b.category}","${b.name.replace(/"/g, '""')}",${b.actualCost},"${b.isPaid ? 'Yes' : 'No'}"\n`;
    });
    csvContent += '\nVendor Name,Service,Category,Status,Contract,Balance\n';
    currentEvent.vendors.forEach((v) => {
      csvContent += `"${v.name.replace(/"/g, '""')}","${v.service.replace(/"/g, '""')}","${v.category}","${v.status}",${v.contractAmount},${v.balanceDue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentEvent.title.replace(/\s+/g, '_')}_Summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search results
  const searchResults = searchQuery.trim()
    ? [
        ...currentEvent.budgetItems
          .filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((b) => ({ type: 'Budget Item', title: b.name, desc: `$${b.actualCost} • ${b.category}` })),
        ...currentEvent.runOfShow
          .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.owner.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((r) => ({ type: 'Timeline Entry', title: r.title, desc: `${r.time} • Owner: ${r.owner}` })),
        ...currentEvent.vendors
          .filter((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.service.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((v) => ({ type: 'Vendor Partner', title: v.name, desc: `${v.category} • ${v.status}` })),
      ]
    : [];

  const totalNotifications = (hasBudgetAlert ? 1 : 0) + (timelineConflictCount > 0 ? 1 : 0);

  return (
    <header
      style={{
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: Brand Logo + Event Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <BrandLogo size="sm" showSubtitle={true} />

          {/* Active Event Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsEventDropdownOpen((prev) => !prev)}
              aria-expanded={isEventDropdownOpen}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                color: '#f8fafc',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentEvent.title}
              </span>
              <ChevronDown size={14} color="#94a3b8" />
            </button>

            {isEventDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.35rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  padding: '0.4rem',
                  minWidth: '220px',
                  zIndex: 200,
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Switch Event Mode
                </div>
                {(['wedding', 'birthday', 'community'] as EventDomain[]).map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => {
                      onSwitchDomain(dom);
                      setIsEventDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeDomain === dom ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: activeDomain === dom ? '#ffffff' : '#cbd5e1',
                      fontSize: '0.825rem',
                      fontWeight: activeDomain === dom ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      {dom === 'wedding' && '💍 Weddings Flow'}
                      {dom === 'birthday' && '🎂 Birthdays Flow'}
                      {dom === 'community' && '🎪 Community Events'}
                    </span>
                    {activeDomain === dom && <Check size={14} color="#818cf8" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Domain Segmented Control Pills */}
        <div
          role="group"
          aria-label="Event Domain Selector"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            padding: '0.25rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            type="button"
            id="pill-wedding"
            className="btn-pill-glow"
            onClick={() => onSwitchDomain('wedding')}
            aria-pressed={activeDomain === 'wedding'}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.825rem',
              fontWeight: activeDomain === 'wedding' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              color: activeDomain === 'wedding' ? '#ffffff' : '#94a3b8',
              backgroundColor: activeDomain === 'wedding' ? '#f43f5e' : 'transparent',
              boxShadow: activeDomain === 'wedding' ? '0 2px 10px rgba(244, 63, 94, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            💍 Weddings
          </button>

          <button
            type="button"
            id="pill-birthday"
            className="btn-pill-glow"
            onClick={() => onSwitchDomain('birthday')}
            aria-pressed={activeDomain === 'birthday'}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.825rem',
              fontWeight: activeDomain === 'birthday' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              color: activeDomain === 'birthday' ? '#ffffff' : '#94a3b8',
              backgroundColor: activeDomain === 'birthday' ? '#8b5cf6' : 'transparent',
              boxShadow: activeDomain === 'birthday' ? '0 2px 10px rgba(139, 92, 246, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            🎂 Birthdays
          </button>

          <button
            type="button"
            id="pill-community"
            className="btn-pill-glow"
            onClick={() => onSwitchDomain('community')}
            aria-pressed={activeDomain === 'community'}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.825rem',
              fontWeight: activeDomain === 'community' ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              color: activeDomain === 'community' ? '#ffffff' : '#94a3b8',
              backgroundColor: activeDomain === 'community' ? '#10b981' : 'transparent',
              boxShadow: activeDomain === 'community' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            🎪 Community
          </button>
        </div>

        {/* Right: Global Action Strip (Quick Add, Search, Export, Theme, Notifications, Reset) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* New Event (< 1 min setup) */}
          <button
            type="button"
            id="btn-new-event-onboarding"
            className="btn-glass-glow"
            onClick={onOpenOnboarding}
            aria-label="Create new event in under 1 minute"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} />
            <span>+ New Event</span>
          </button>

          {/* Planning Assistant Chat Trigger */}
          <button
            type="button"
            id="btn-planning-assistant"
            className="btn-glass-glow"
            onClick={onOpenAssistant}
            aria-label="Open AI Planning Assistant Chat"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              color: '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Bot size={15} />
            <span>AI Assistant</span>
          </button>

          {/* Quick Add Action Trigger */}
          <button
            type="button"
            id="btn-quick-add"
            className="btn-glass-glow"
            onClick={() => onQuickAddItem && onQuickAddItem('budget')}
            aria-label="Quick add expense or activity"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={14} />
            <span>+ Quick Add</span>
          </button>

          {/* Global Search hotkey trigger */}
          <button
            type="button"
            className="btn-glass-glow"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open global search (Cmd+K)"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              color: '#94a3b8',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Export Plan (PDF / CSV / Shareable Summary) */}
          <button
            type="button"
            className="btn-glass-glow"
            onClick={onOpenShareablePlan || handleExportCSV}
            title="Export Plan as PDF/CSV and Shareable Summary"
            aria-label="Export Plan as PDF/CSV and Shareable Summary"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.4rem 0.65rem',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
            }}
          >
            <Share2 size={14} />
            <span>Export Plan</span>
          </button>

          {/* Theme Toggle (High-Contrast Mode) */}
          <button
            type="button"
            className="btn-glass-glow"
            onClick={toggleHighContrast}
            title="Toggle High-Contrast Mode (WCAG 2.1 AA)"
            aria-label="Toggle High-Contrast Mode"
            style={{
              backgroundColor: isHighContrast ? '#ffffff' : 'transparent',
              color: isHighContrast ? '#000000' : '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.4rem 0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SunMoon size={15} />
          </button>

          {/* Notification Center Badge */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-glass-glow"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              aria-label={`Notifications (${totalNotifications} alerts)`}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.4rem 0.5rem',
                color: totalNotifications > 0 ? '#f59e0b' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Bell size={15} />
              {totalNotifications > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                  }}
                />
              )}
            </button>

            {isNotificationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  padding: '1rem',
                  minWidth: '280px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                  Live System Alerts
                </div>
                {totalNotifications === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>All systems healthy • Zero active alerts</span>
                ) : (
                  <>
                    {hasBudgetAlert && (
                      <div style={{ fontSize: '0.8rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={14} /> Budget threshold exceeds 90%
                      </div>
                    )}
                    {timelineConflictCount > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={14} /> {timelineConflictCount} timeline conflict(s) detected
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reset Demo button */}
          <button
            type="button"
            className="btn-glass-glow"
            onClick={() => {
              if (window.confirm('Reset this planner to standard factory default data?')) {
                onResetDefaults();
              }
            }}
            title="Reset data"
            aria-label="Reset planner to factory defaults"
            style={{
              padding: '0.4rem 0.65rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Global Search & Command Palette Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Global UtsavOS Search & Command Palette"
        description="Search across budget line items, timeline activities, vendors, and guests."
        maxWidth="540px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#090d16',
              border: '1px solid #6366f1',
              borderRadius: '10px',
              padding: '0.6rem 0.85rem',
            }}
          >
            <Search size={18} color="#818cf8" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search activities, vendors, costs..."
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {searchResults.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '1.5rem' }}>
                {searchQuery ? 'No matching records found.' : 'Start typing to instantly query your event dataset.'}
              </span>
            ) : (
              searchResults.map((res, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{res.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{res.desc}</div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {res.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </header>
  );
};
