import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  collapsed?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  collapsed = false,
  className = '',
  onClick,
}) => {
  // Dimension tokens
  const dimensions = {
    sm: { markWidth: 38, markHeight: 28, titleSize: '0.95rem', subSize: '0.72rem', tinySize: '0.48rem', gap: '0.5rem' },
    md: { markWidth: 54, markHeight: 40, titleSize: '1.25rem', subSize: '0.9rem', tinySize: '0.58rem', gap: '0.75rem' },
    lg: { markWidth: 72, markHeight: 54, titleSize: '1.65rem', subSize: '1.15rem', tinySize: '0.7rem', gap: '0.9rem' },
  }[size];

  return (
    <div
      className={`utsav-brand-logo-container ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dimensions.gap,
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
      aria-label="UtsavOS | Planora AI Event Operating System"
    >
      {/* Brand Vector Insignia Mark */}
      <div
        className="utsav-mark-wrapper"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={dimensions.markWidth}
          height={dimensions.markHeight}
          viewBox="0 0 170 115"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            filter: 'drop-shadow(0 0 14px rgba(244, 63, 94, 0.45)) drop-shadow(0 0 24px rgba(168, 85, 247, 0.35))',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease',
          }}
          className="utsav-insignia-svg"
        >
          <defs>
            {/* Saffron/Gold to Neon Rose to Purple/Violet Gradient */}
            <linearGradient id="utsavInfinityGrad" x1="10%" y1="20%" x2="90%" y2="80%">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="28%" stopColor="#FF5722" />
              <stop offset="55%" stopColor="#F43F5E" />
              <stop offset="78%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>

            {/* Inner Left Ribbon Warm Accent */}
            <linearGradient id="utsavLeftLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            {/* Right Gear & Loop Cool Accent */}
            <linearGradient id="utsavRightLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>

            {/* Sparkle Gold Gradient */}
            <linearGradient id="utsavSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="50%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Dropdown Glow Filter */}
            <filter id="utsavGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Top Star Sparkle with Glowing Points */}
          <g className="utsav-sparkle-group" filter="url(#utsavGlowFilter)">
            {/* 4-point radiant diamond sparkle */}
            <path
              d="M 68 8 Q 68 22 56 22 Q 68 22 68 36 Q 68 22 80 22 Q 68 22 68 8 Z"
              fill="url(#utsavSparkleGrad)"
            />
            {/* Center sparkle core highlight */}
            <circle cx="68" cy="22" r="2.2" fill="#FFFFFF" />
            {/* Secondary micro spark dots */}
            <circle cx="53" cy="14" r="1.6" fill="#FDE047" opacity="0.9" />
            <circle cx="83" cy="15" r="1.4" fill="#FDE047" opacity="0.85" />
          </g>

          {/* Outer Gear Teeth on Upper-Right Ribbon Curve */}
          <g className="utsav-ribbon-cogs" fill="url(#utsavRightLoopGrad)">
            {/* Tooth 1 */}
            <path d="M 98 42 L 102 36 L 109 39 L 106 45 Z" />
            {/* Tooth 2 */}
            <path d="M 113 46 L 118 41 L 125 45 L 121 51 Z" />
            {/* Tooth 3 */}
            <path d="M 126 53 L 133 50 L 138 56 L 132 60 Z" />
          </g>

          {/* Background Ambient Glow Ribbon Stroke */}
          <path
            d="M 68 64 C 44 88, 14 78, 14 55 C 14 32, 44 24, 68 64 C 92 104, 122 96, 122 64 C 122 36, 92 30, 68 64 Z"
            fill="none"
            stroke="url(#utsavInfinityGrad)"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
            filter="url(#utsavGlowFilter)"
          />

          {/* Core Infinity Ribbon */}
          <path
            d="M 68 64 C 44 88, 14 78, 14 55 C 14 32, 44 24, 68 64 C 92 104, 122 96, 122 64 C 122 36, 92 30, 68 64 Z"
            fill="none"
            stroke="url(#utsavInfinityGrad)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ribbon Inner Bevel / Highlight Curve */}
          <path
            d="M 66 62 C 43 85, 17 76, 17 55 C 17 35, 43 27, 66 62"
            fill="none"
            stroke="url(#utsavLeftLoopGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Right Inner Loop: Central Gear/Cog Insignia */}
          <g transform="translate(103, 64)" className="utsav-central-gear">
            {/* Gear Body with 8 teeth */}
            <path
              d="M 0 -13 
                 L 2.5 -13 L 3.5 -10 L 7.5 -11 L 9.5 -8.5 L 6.5 -6 L 9.5 -3 L 12 -4 L 13 -1.5 L 10 1.5 L 12 4.5 L 9.5 7 L 7 4.5 L 4.5 7.5 L 5.5 11 L 3 12.5 L 0 9.5 L -3 12.5 L -5.5 11 L -4.5 7.5 L -7 4.5 L -9.5 7 L -12 4.5 L -10 1.5 L -13 -1.5 L -12 -4 L -9.5 -3 L -6.5 -6 L -9.5 -8.5 L -7.5 -11 L -3.5 -10 L -2.5 -13 Z"
              fill="url(#utsavRightLoopGrad)"
              filter="drop-shadow(0 0 4px rgba(168, 85, 247, 0.6))"
            />
            {/* Central Gear Axle Hole */}
            <circle cx="0" cy="0" r="4.2" fill="#0B0F19" stroke="url(#utsavRightLoopGrad)" strokeWidth="1.8" />
          </g>

          {/* Celebratory Lotus Flourish & Hanging Gems at Bottom Intersection */}
          <g className="utsav-lotus-flourish" filter="url(#utsavGlowFilter)">
            {/* Center Petal */}
            <path
              d="M 68 76 C 65 83, 64 90, 68 97 C 72 90, 71 83, 68 76 Z"
              fill="url(#utsavLeftLoopGrad)"
            />
            {/* Left Petal */}
            <path
              d="M 64 78 C 57 82, 51 86, 54 92 C 59 90, 63 84, 64 78 Z"
              fill="url(#utsavLeftLoopGrad)"
            />
            {/* Right Petal */}
            <path
              d="M 72 78 C 79 82, 85 86, 82 92 C 77 90, 73 84, 72 78 Z"
              fill="url(#utsavInfinityGrad)"
            />
            {/* Hanging Teardrop Gem */}
            <circle cx="68" cy="102" r="2.2" fill="url(#utsavSparkleGrad)" />
            <circle cx="58" cy="97" r="1.4" fill="url(#utsavSparkleGrad)" opacity="0.85" />
            <circle cx="78" cy="97" r="1.4" fill="url(#utsavSparkleGrad)" opacity="0.85" />
          </g>
        </svg>
      </div>

      {/* Typography Block */}
      {!collapsed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            lineHeight: 1.1,
          }}
        >
          {/* Row 1: UtsavOS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.12rem',
              letterSpacing: '-0.03em',
            }}
          >
            <span
              style={{
                fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
                fontSize: dimensions.titleSize,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              Utsav
            </span>
            <span
              style={{
                fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
                fontSize: dimensions.titleSize,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #F43F5E 0%, #D946EF 50%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em',
                filter: 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.4))',
              }}
            >
              OS
            </span>
          </div>

          {/* Row 2: Planora AI */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.2rem',
              marginTop: '0.08rem',
            }}
          >
            <span
              style={{
                fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
                fontSize: dimensions.subSize,
                fontWeight: 700,
                color: '#F1F5F9',
                letterSpacing: '-0.015em',
              }}
            >
              Planora
            </span>
            <span
              style={{
                fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
                fontSize: dimensions.subSize,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FB7185 0%, #C084FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.02em',
              }}
            >
              AI
            </span>
          </div>

          {/* Row 3: Subtitle */}
          {showSubtitle && (
            <div
              style={{
                fontSize: dimensions.tinySize,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#94A3B8',
                marginTop: '0.15rem',
                whiteSpace: 'nowrap',
              }}
            >
              AI-POWERED EVENT OPERATING SYSTEM
            </div>
          )}
        </div>
      )}
    </div>
  );
};
