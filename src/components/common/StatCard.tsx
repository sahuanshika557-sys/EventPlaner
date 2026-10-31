import React, { type ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: ReactNode;
  icon?: ReactNode;
  accentColor?: string;
  badge?: ReactNode;
  alert?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = '#6366f1',
  badge,
  alert = false,
}) => {
  return (
    <article
      className="stat-card"
      style={{
        backgroundColor: 'rgba(26, 31, 48, 0.75)',
        backdropFilter: 'blur(12px)',
        border: alert ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: alert
          ? '0 10px 25px -5px rgba(239, 68, 68, 0.25)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Radiant accent indicator bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: alert ? '#ef4444' : accentColor,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#94a3b8',
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: `${accentColor}22`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
        <span
          style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: alert ? '#f87171' : '#f8fafc',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {badge}
      </div>

      {subtitle && (
        <span
          style={{
            fontSize: '0.8125rem',
            color: '#64748b',
            marginTop: '0.5rem',
          }}
        >
          {subtitle}
        </span>
      )}
    </article>
  );
};
