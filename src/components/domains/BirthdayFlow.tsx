import React, { useState } from 'react';
import type {
  BirthdayFlowState,
  BirthdayCategoryTier,
  CakeAndGameTimelineItem,
  PartyFavorItem,
} from '../../types/birthday';
import { Badge, type BadgeVariant } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Sparkles,
  Cake,
  Gamepad2,
  Gift,
  Clock,
  Music,
  CheckCircle2,
  Plus,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthdayFlowProps {
  data: BirthdayFlowState;
  onUpdateGames: (games: CakeAndGameTimelineItem[]) => void;
  onUpdateFavors: (favors: PartyFavorItem[]) => void;
  onUpdateDetails: (details: {
    celebrantName?: string;
    ageCelebrating?: number;
    cakeFlavor?: string;
    themeTitle?: string;
  }) => void;
}

const THEME_PRESETS: { category: BirthdayCategoryTier; title: string; ageRange: string; colors: string[]; description: string }[] = [
  {
    category: 'kids',
    title: 'Galactic Superhero Academy',
    ageRange: 'Ages 4 - 12',
    colors: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'],
    description: 'Laser maze agility training, superhero cape fittings, cosmic cupcakes, and epic sound cues.',
  },
  {
    category: 'sweet16',
    title: 'Neon Horizon & Glow Glamour',
    ageRange: 'Age 15 - 18',
    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'],
    description: 'UV blacklight dance floor, 360 photo glitz pod, LED mocktail bar, and iridescent favors.',
  },
  {
    category: 'adult',
    title: 'Vintage Speakeasy & Velvet Jazz',
    ageRange: 'Ages 21, 30, 40, 50, 60+',
    colors: ['#d4af37', '#1e1b4b', '#78350f', '#0f172a'],
    description: 'Craft mixology lab, secret password entrance, live acoustic swing band, and artisanal cigars & truffles.',
  },
];

export const BirthdayFlow: React.FC<BirthdayFlowProps> = ({
  data,
  onUpdateGames,
  onUpdateFavors,
  onUpdateDetails,
}) => {
  const [subSection, setSubSection] = useState<'theme' | 'games' | 'favors'>('theme');

  // New Game Modal state
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [gameType, setGameType] = useState<'cake' | 'game' | 'toast' | 'performance'>('game');
  const [gameTime, setGameTime] = useState('03:00 PM');
  const [gameHost, setGameHost] = useState('');
  const [gameMusic, setGameMusic] = useState('');
  const [gameProps, setGameProps] = useState('');
  const [gameDuration] = useState(20);

  // New Favor Modal state
  const [isFavorModalOpen, setIsFavorModalOpen] = useState(false);
  const [favorName, setFavorName] = useState('');
  const [favorTarget, setFavorTarget] = useState(40);
  const [favorPrepared] = useState(40);
  const [favorCost, setFavorCost] = useState('5.00');
  const [favorStatus, setFavorStatus] = useState<PartyFavorItem['packagingStatus']>('Ready');
  const [favorGroup, setFavorGroup] = useState<PartyFavorItem['recipientGroup']>('Kids');
  const [favorStation, setFavorStation] = useState('Exit Table');

  // Balloon Decor Calculator State
  const [balloonArchLength, setBalloonArchLength] = useState<number>(5); // meters
  const [balloonDensity, setBalloonDensity] = useState<'standard' | 'luxe' | 'cloud'>('luxe');

  // Interactive Cake Cutting Melodic Fanfare Trigger
  const handleTriggerCakeMusic = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        const notes = [
          { f: 392.0, d: 0.22 }, // G4
          { f: 392.0, d: 0.22 }, // G4
          { f: 440.0, d: 0.4 },  // A4
          { f: 392.0, d: 0.4 },  // G4
          { f: 523.25, d: 0.45 }, // C5
          { f: 493.88, d: 0.7 }, // B4
        ];
        let offset = 0;
        notes.forEach(({ f, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime + offset);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + offset + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + d);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + d);
          offset += d + 0.04;
        });
      }
    } catch {
      // Audio fallback
    }

    try {
      confetti({
        particleCount: 75,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleToggleGameCompleted = (id: string, current: boolean) => {
    const updated = data.cakeAndGames.map((g) =>
      g.id === id ? { ...g, isCompleted: !g.isCompleted } : g
    );
    onUpdateGames(updated);
    if (!current) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#ec4899', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim()) return;

    const newItem: CakeAndGameTimelineItem = {
      id: `game_${Date.now()}`,
      time: gameTime.trim(),
      type: gameType,
      title: gameTitle.trim(),
      hostOrLead: gameHost.trim() || 'Party Host',
      musicCue: gameMusic.trim() || 'Party Beat Track',
      propsRequired: gameProps.trim() || 'None',
      durationMinutes: gameDuration || 15,
      isCompleted: false,
    };

    onUpdateGames([...data.cakeAndGames, newItem]);
    setIsGameModalOpen(false);
    setGameTitle('');
    setGameHost('');
    setGameMusic('');
    setGameProps('');
  };

  const handleAddFavor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!favorName.trim()) return;

    const newFavor: PartyFavorItem = {
      id: `fav_${Date.now()}`,
      itemName: favorName.trim(),
      targetCount: favorTarget,
      preparedCount: favorPrepared,
      unitCost: parseFloat(favorCost) || 0,
      packagingStatus: favorStatus,
      recipientGroup: favorGroup,
      distributionStation: favorStation.trim() || 'Exit Station',
    };

    onUpdateFavors([...data.partyFavors, newFavor]);
    setIsFavorModalOpen(false);
    setFavorName('');
    setFavorStation('Exit Table');
  };

  const PACKAGING_VARIANTS: Record<PartyFavorItem['packagingStatus'], BadgeVariant> = {
    Pending: 'neutral',
    'In Assembly': 'warning',
    Ready: 'info',
    Distributed: 'success',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub navigation */}
      <div
        role="tablist"
        aria-label="Birthday Flow Sections"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(26, 31, 48, 0.65)',
          padding: '0.4rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={subSection === 'theme'}
          onClick={() => setSubSection('theme')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: subSection === 'theme' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: subSection === 'theme' ? '#ffffff' : '#94a3b8',
            background: subSection === 'theme' ? 'linear-gradient(135deg, #db2777, #f43f5e)' : 'transparent',
          }}
        >
          <Sparkles size={15} />
          <span>Milestone & Theme Selector</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subSection === 'games'}
          onClick={() => setSubSection('games')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: subSection === 'games' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: subSection === 'games' ? '#ffffff' : '#94a3b8',
            background: subSection === 'games' ? 'linear-gradient(135deg, #db2777, #f43f5e)' : 'transparent',
          }}
        >
          <Gamepad2 size={15} />
          <span>Cake Cut & Game Timelines ({data.cakeAndGames.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subSection === 'favors'}
          onClick={() => setSubSection('favors')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: subSection === 'favors' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: subSection === 'favors' ? '#ffffff' : '#94a3b8',
            background: subSection === 'favors' ? 'linear-gradient(135deg, #db2777, #f43f5e)' : 'transparent',
          }}
        >
          <Gift size={15} />
          <span>Party Favor Checklist ({data.partyFavors.length})</span>
        </button>
      </div>

      {/* 1. Theme & Milestone Selector View */}
      {subSection === 'theme' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Milestone Quick Selector */}
          <div
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              background: 'linear-gradient(135deg, rgba(20, 26, 43, 0.8), rgba(15, 23, 42, 0.9))',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Milestone Age Customizer:
              </span>
              <span style={{ fontSize: '0.75rem', color: '#f472b6', fontWeight: 600 }}>
                Celebrating: {data.ageCelebrating} Years Old
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[
                { label: '👶 1st Birthday', age: 1, theme: 'Enchanted Woodland Fairytale' },
                { label: '🧒 10th Epic Galactic', age: 10, theme: 'Galactic Superhero Academy' },
                { label: '✨ Sweet 16 Glow', age: 16, theme: 'Neon Horizon & Glow Glamour' },
                { label: '🥂 21st Speakeasy', age: 21, theme: 'Vintage Speakeasy & Velvet Jazz' },
                { label: '⭐ 30th Prime Era', age: 30, theme: 'Rooftop Lounge & Mixology' },
                { label: '👑 50th Golden Jubilee', age: 50, theme: 'Vintage Speakeasy & Velvet Jazz' },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => onUpdateDetails({ ageCelebrating: m.age, themeTitle: m.theme })}
                  className="btn-glass-glow"
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: data.ageCelebrating === m.age ? '1px solid #f472b6' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: data.ageCelebrating === m.age ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: data.ageCelebrating === m.age ? '#f472b6' : '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Celebrant Profile Editor Card */}
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Celebrant Name:
              </label>
              <input
                type="text"
                value={data.celebrantName}
                onChange={(e) => onUpdateDetails({ celebrantName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#0f1322',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Age Milestone Celebrating:
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={data.ageCelebrating}
                onChange={(e) => onUpdateDetails({ ageCelebrating: parseInt(e.target.value, 10) || 1 })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#0f1322',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Signature Cake Flavor:
              </label>
              <input
                type="text"
                value={data.cakeFlavor}
                onChange={(e) => onUpdateDetails({ cakeFlavor: e.target.value })}
                placeholder="e.g. Belgian Chocolate Mousse"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#0f1322',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Balloon Decor & Installation Calculator */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(20, 26, 43, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  🎈 Interactive Balloon Decor & Garland Calculator
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                  Estimate total latex counts, helium canisters, foil number centerpieces, and setup labor.
                </p>
              </div>
              <Badge variant="info" size="sm">
                Milestone: Age {data.ageCelebrating}
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                  Arch / Garland Length: <strong>{balloonArchLength} Meters</strong> ({Math.round(balloonArchLength * 3.28)} ft)
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={balloonArchLength}
                  onChange={(e) => setBalloonArchLength(parseInt(e.target.value, 10) || 5)}
                  style={{ width: '100%', accentColor: '#8b5cf6' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                  Garland Density & Styling:
                </label>
                <select
                  value={balloonDensity}
                  onChange={(e) => setBalloonDensity(e.target.value as 'standard' | 'luxe' | 'cloud')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#0f1322',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="standard">Standard Spiral (30 balloons/m)</option>
                  <option value="luxe">Luxe Organic Demi-Arch (45 balloons/m)</option>
                  <option value="cloud">Cloud Luxe Canopy (60 balloons/m)</option>
                </select>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#0f1322', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total Latex Balloons</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                  {balloonArchLength * (balloonDensity === 'standard' ? 30 : balloonDensity === 'luxe' ? 45 : 60)} pcs
                </div>
              </div>
              <div style={{ backgroundColor: '#0f1322', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Foil Numbers</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fde047' }}>
                  2 pcs (#{data.ageCelebrating})
                </div>
              </div>
              <div style={{ backgroundColor: '#0f1322', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Helium Canisters</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                  {Math.ceil((balloonArchLength * (balloonDensity === 'standard' ? 30 : balloonDensity === 'luxe' ? 45 : 60)) / 90)} Tanks
                </div>
              </div>
              <div style={{ backgroundColor: '#0f1322', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Est. Setup Time</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ec4899' }}>
                  {(balloonArchLength * 0.45).toFixed(1)} hrs
                </div>
              </div>
              <div style={{ backgroundColor: '#0f1322', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Estimated Cost</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>
                  ${Math.round(balloonArchLength * (balloonDensity === 'standard' ? 30 : balloonDensity === 'luxe' ? 45 : 60) * 0.85 + 65)}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Presets Gallery */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Curated Milestone Concept Themes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {THEME_PRESETS.map((preset) => {
                const isSelected = data.themeTitle.toLowerCase().includes(preset.title.toLowerCase().substring(0, 8));

                return (
                  <article
                    key={preset.title}
                    onClick={() => onUpdateDetails({ themeTitle: preset.title })}
                    style={{
                      backgroundColor: 'rgba(26, 31, 48, 0.65)',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #db2777' : '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: isSelected ? '0 8px 25px rgba(219, 39, 119, 0.25)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: '#f43f5e' }}>
                        {preset.category.toUpperCase()} • {preset.ageRange}
                      </span>
                      {isSelected && (
                        <Badge variant="success" size="sm" icon={<CheckCircle2 size={11} />}>
                          Active Theme
                        </Badge>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {preset.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                      {preset.description}
                    </p>

                    {/* Color Swatches */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Palette:</span>
                      {preset.colors.map((c, i) => (
                        <span
                          key={i}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: c,
                            display: 'inline-block',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          }}
                        />
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Cake Cut & Game Timelines View */}
      {subSection === 'games' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                Cake Cutting & Interactive Game Sequence
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Synchronized music cues, party hosts, props required, and ritual timings.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                id="btn-trigger-cake-fanfare"
                onClick={handleTriggerCakeMusic}
                className="btn-glass-glow"
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
                }}
              >
                <Music size={15} /> Play Cake Fanfare & Confetti
              </button>

              <button
                type="button"
                onClick={() => setIsGameModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #db2777, #f43f5e)',
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
                <Plus size={15} /> Add Game / Ritual
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.cakeAndGames.map((item) => (
              <article
                key={item.id}
                style={{
                  backgroundColor: 'rgba(26, 31, 48, 0.65)',
                  borderRadius: '14px',
                  border: item.isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleGameCompleted(item.id, item.isCompleted)}
                    aria-label={`Mark ${item.title} as ${item.isCompleted ? 'incomplete' : 'completed'}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.isCompleted ? '#34d399' : '#64748b' }}
                  >
                    <CheckCircle2 size={20} />
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.type === 'cake' ? <Cake size={16} color="#f43f5e" /> : <Gamepad2 size={16} color="#38bdf8" />}
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: item.isCompleted ? '#94a3b8' : '#f8fafc',
                          textDecoration: item.isCompleted ? 'line-through' : 'none',
                          margin: 0,
                        }}
                      >
                        {item.title}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {item.time} ({item.durationMinutes} min)
                      </span>
                      <span>Lead: <strong style={{ color: '#cbd5e1' }}>{item.hostOrLead}</strong></span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Music size={12} color="#ec4899" /> Cue: {item.musicCue}
                      </span>
                    </div>

                    {item.propsRequired && item.propsRequired !== 'None' && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Props: {item.propsRequired}
                      </div>
                    )}
                  </div>
                </div>

                <Badge variant={item.isCompleted ? 'success' : 'neutral'} size="sm">
                  {item.isCompleted ? 'Finished' : 'Upcoming'}
                </Badge>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 3. Party Favor Checklist View */}
      {subSection === 'favors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                Party Favor & Take-Home Keepsake Checklist
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Inventory counts, packaging statuses, recipient groups, and handover stations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFavorModalOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #db2777, #f43f5e)',
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
              <Plus size={15} /> Add Favor Item
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {data.partyFavors.map((fav) => {
              const isReady = fav.packagingStatus === 'Ready' || fav.packagingStatus === 'Distributed';

              return (
                <article
                  key={fav.id}
                  style={{
                    backgroundColor: 'rgba(26, 31, 48, 0.65)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                        {fav.itemName}
                      </h4>
                      <Badge variant="neutral" size="sm">
                        Group: {fav.recipientGroup}
                      </Badge>
                    </div>
                    <Badge variant={PACKAGING_VARIANTS[fav.packagingStatus]} size="sm">
                      {fav.packagingStatus}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <span>Prepared Count:</span>
                    <strong style={{ color: isReady ? '#34d399' : '#f59e0b' }}>
                      {fav.preparedCount} / {fav.targetCount}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span>Estimated Cost:</span>
                    <span>${fav.unitCost.toFixed(2)} / unit (${(fav.unitCost * fav.targetCount).toFixed(2)} total)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                    <Package size={13} color="#38bdf8" />
                    <span>Station: {fav.distributionStation}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Game Modal */}
      <Modal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        title="Add Birthday Game or Milestone Activity"
        description="Schedule cake cut, toasts, or party games with cues."
      >
        <form onSubmit={handleAddGame} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g. Scavenger Hunt Challenge"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Activity Type
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value as CakeAndGameTimelineItem['type'])}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="game">Party Game</option>
                <option value="cake">Cake Cutting</option>
                <option value="toast">Toast / Speech</option>
                <option value="performance">Live Performance</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Start Time
              </label>
              <input
                type="text"
                value={gameTime}
                onChange={(e) => setGameTime(e.target.value)}
                placeholder="e.g. 03:30 PM"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Host / Facilitator
              </label>
              <input
                type="text"
                value={gameHost}
                onChange={(e) => setGameHost(e.target.value)}
                placeholder="e.g. DJ Pulse"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Music Cue Track
              </label>
              <input
                type="text"
                value={gameMusic}
                onChange={(e) => setGameMusic(e.target.value)}
                placeholder="e.g. Happy Birthday Trap Remix"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsGameModalOpen(false)}
              style={{ padding: '0.6rem 1.25rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #db2777, #f43f5e)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Add Activity
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Favor Modal */}
      <Modal
        isOpen={isFavorModalOpen}
        onClose={() => setIsFavorModalOpen(false)}
        title="Add Party Favor Item"
        description="Track favor production and distribution."
      >
        <form onSubmit={handleAddFavor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Favor Item Name *
            </label>
            <input
              type="text"
              required
              value={favorName}
              onChange={(e) => setFavorName(e.target.value)}
              placeholder="e.g. Customized Glow Tumblers"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Target Count
              </label>
              <input
                type="number"
                min="1"
                value={favorTarget}
                onChange={(e) => setFavorTarget(parseInt(e.target.value, 10) || 1)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Unit Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={favorCost}
                onChange={(e) => setFavorCost(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Recipient Group
              </label>
              <select
                value={favorGroup}
                onChange={(e) => setFavorGroup(e.target.value as PartyFavorItem['recipientGroup'])}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Kids">Kids</option>
                <option value="Teens">Teens</option>
                <option value="Adults">Adults</option>
                <option value="VIPs">VIPs</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Packaging Status
              </label>
              <select
                value={favorStatus}
                onChange={(e) => setFavorStatus(e.target.value as PartyFavorItem['packagingStatus'])}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Pending">Pending</option>
                <option value="In Assembly">In Assembly</option>
                <option value="Ready">Ready</option>
                <option value="Distributed">Distributed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsFavorModalOpen(false)}
              style={{ padding: '0.6rem 1.25rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #db2777, #f43f5e)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Save Favor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
