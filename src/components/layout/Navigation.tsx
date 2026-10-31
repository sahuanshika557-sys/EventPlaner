import React from 'react';
import { LayoutGrid, DollarSign, Clock, Users2, Sparkles, BarChart3 } from 'lucide-react';

export type NavTabId = 'dashboard' | 'domain-hub' | 'budget' | 'timeline' | 'vendors' | 'ai-engine';

interface NavigationProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  domainName: string;
  hasBudgetAlert?: boolean;
  timelineConflictCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  domainName,
  hasBudgetAlert = false,
  timelineConflictCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as NavTabId,
      label: 'Dashboard',
      icon: <BarChart3 size={18} />,
      highlight: true,
    },
    {
      id: 'domain-hub' as NavTabId,
      label: `${domainName} Operations Hub`,
      icon: <LayoutGrid size={18} />,
    },
    {
      id: 'budget' as NavTabId,
      label: 'Interactive Budget Matrix',
      icon: <DollarSign size={18} />,
      badge: hasBudgetAlert ? 'Alert' : undefined,
      badgeColor: '#ef4444',
    },
    {
      id: 'timeline' as NavTabId,
      label: 'Dual-Layer Timeline',
      icon: <Clock size={18} />,
      badge: timelineConflictCount > 0 ? `${timelineConflictCount} conflict` : undefined,
      badgeColor: '#f59e0b',
    },
    {
      id: 'vendors' as NavTabId,
      label: 'Vendor Board',
      icon: <Users2 size={18} />,
    },
    {
      id: 'ai-engine' as NavTabId,
      label: 'GenAI Concept Engine',
      icon: <Sparkles size={18} />,
      highlight: true,
    },
  ];

  return (
    <nav
      aria-label="Application Sections"
      style={{
        backgroundColor: '#111422',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`nav-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#f8fafc' : '#94a3b8',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #d4af37' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ color: isActive ? '#d4af37' : 'currentColor' }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    backgroundColor: tab.badgeColor,
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                  }}
                >
                  {tab.badge}
                </span>
              )}
              {tab.highlight && !tab.badge && (
                <span
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #ec4899)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
