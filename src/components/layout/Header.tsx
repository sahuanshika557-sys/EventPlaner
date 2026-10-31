import React from 'react';
import type { EventDomain, EventModel } from '../../types/event';
import { Calendar, MapPin, Users, RotateCcw } from 'lucide-react';
import { Badge } from '../common/Badge';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentEvent: EventModel;
  activeDomain: EventDomain;
  onSwitchDomain: (domain: EventDomain) => void;
  onResetDefaults: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentEvent,
  activeDomain,
  onSwitchDomain,
  onResetDefaults,
}) => {
  return (
    <header
      style={{
        backgroundColor: 'rgba(15, 19, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Top Bar: Brand + Domain Switcher + Reset */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BrandLogo size="md" showSubtitle={true} />
            <Badge variant="gold" size="sm">
              PRO OS
            </Badge>
          </div>

          {/* Domain Selection Tabs (Weddings / Birthdays / Community) */}
          <div
            role="group"
            aria-label="Event Domain Selection"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.3rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              id="domain-tab-wedding"
              onClick={() => onSwitchDomain('wedding')}
              aria-pressed={activeDomain === 'wedding'}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: activeDomain === 'wedding' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor:
                  activeDomain === 'wedding'
                    ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                    : 'transparent',
                color: activeDomain === 'wedding' ? '#ffffff' : '#94a3b8',
                background:
                  activeDomain === 'wedding'
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    : 'transparent',
                boxShadow:
                  activeDomain === 'wedding'
                    ? '0 4px 12px rgba(99, 102, 241, 0.35)'
                    : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>💍</span>
              <span>Weddings Flow</span>
            </button>

            <button
              type="button"
              id="domain-tab-birthday"
              onClick={() => onSwitchDomain('birthday')}
              aria-pressed={activeDomain === 'birthday'}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: activeDomain === 'birthday' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: activeDomain === 'birthday' ? '#ffffff' : '#94a3b8',
                background:
                  activeDomain === 'birthday'
                    ? 'linear-gradient(135deg, #db2777 0%, #f43f5e 100%)'
                    : 'transparent',
                boxShadow:
                  activeDomain === 'birthday'
                    ? '0 4px 12px rgba(219, 39, 119, 0.35)'
                    : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🎂</span>
              <span>Birthdays Flow</span>
            </button>

            <button
              type="button"
              id="domain-tab-community"
              onClick={() => onSwitchDomain('community')}
              aria-pressed={activeDomain === 'community'}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: activeDomain === 'community' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: activeDomain === 'community' ? '#ffffff' : '#94a3b8',
                background:
                  activeDomain === 'community'
                    ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                    : 'transparent',
                boxShadow:
                  activeDomain === 'community'
                    ? '0 4px 12px rgba(16, 185, 129, 0.35)'
                    : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🎪</span>
              <span>Community Events</span>
            </button>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset this planner to standard factory default data?')) {
                onResetDefaults();
              }
            }}
            title="Reset data to initial state"
            aria-label="Reset planner to factory defaults"
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background-color 0.2s, color 0.2s',
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Event Title Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.25rem',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#f8fafc',
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {currentEvent.title}
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                margin: 0,
              }}
            >
              {currentEvent.tagline}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              fontSize: '0.875rem',
              color: '#cbd5e1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color="#d4af37" />
              <span>{currentEvent.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="#38bdf8" />
              <span>{currentEvent.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} color="#34d399" />
              <span>{currentEvent.guestCount} Guests Expected</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
