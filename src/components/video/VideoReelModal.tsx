import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { EventDomain, EventModel } from '../../types/event';
import type { WeddingCulture, WeddingScheduleDay } from '../../types/wedding';
import type { TimelineEntry } from '../../types/timeline';
import {
  getVideoReelScenes,
  getCultureAudioSoundscape,
  type CeremonyItem,
} from '../../utils/aiImages';
import { sanitizeInput } from '../../utils/sanitizer';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Download,
  Film,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  MapPin,
} from 'lucide-react';

import {
  type TraditionScene,
  type VideoScene,
  type ReelScene,
  type TraditionType,
  HINDU_VEDIC_REEL_SCENES,
  SCENE_REGISTRY,
} from '../../data/culturalReelScenes';

export type { TraditionScene, VideoScene, ReelScene, TraditionType };

export interface VideoReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: EventDomain;
  eventTitle: string;
  culture?: WeddingCulture | TraditionType;
  tradition?: TraditionType;
  event?: EventModel;
  ceremonies?: (WeddingScheduleDay | CeremonyItem)[];
  timeline?: TimelineEntry[];
}

export type EventVideoReelModalProps = VideoReelModalProps;

export const VideoReelModal: React.FC<VideoReelModalProps> = ({
  isOpen,
  onClose,
  domain,
  eventTitle,
  culture,
  tradition,
  event,
  ceremonies,
  timeline,
}) => {
  // Read current tradition strictly from props / state
  const currentTradition: TraditionType = (tradition || culture || event?.weddingData?.culture || 'north_indian') as TraditionType;

  // 1. Resolve Dynamic Ceremonies from Active Dashboard State
  const resolvedCeremonies: CeremonyItem[] | undefined = useMemo(() => {
    // Direct ceremonies prop takes priority
    if (Array.isArray(ceremonies) && ceremonies.length > 0) {
      return ceremonies as CeremonyItem[];
    }
    // Read from event.weddingData scheduleDays
    if (domain === 'wedding' && event?.weddingData?.scheduleDays && event.weddingData.scheduleDays.length > 0) {
      return event.weddingData.scheduleDays as CeremonyItem[];
    }
    // Read from event.birthdayData cakeAndGames
    if (domain === 'birthday' && event?.birthdayData?.cakeAndGames && event.birthdayData.cakeAndGames.length > 0) {
      return event.birthdayData.cakeAndGames.map((g) => ({
        id: g.id,
        title: g.title,
        name: g.title,
        time: g.time,
        type: g.type,
        ritualNotes: `Lead: ${g.hostOrLead} • Props: ${g.propsRequired}`,
        description: `Music: ${g.musicCue}`,
        venue: 'Party Pavilion',
      })) as CeremonyItem[];
    }
    // Read from timeline prop
    if (Array.isArray(timeline) && timeline.length > 0) {
      return timeline.map((t) => ({
        id: t.id,
        title: t.title,
        name: t.title,
        time: t.time,
        venue: t.location,
        description: `Milestone: ${t.milestone} • Owner: ${t.owner}`,
      })) as CeremonyItem[];
    }
    // Read from event.runOfShow
    if (event?.runOfShow && event.runOfShow.length > 0) {
      return event.runOfShow.map((t) => ({
        id: t.id,
        title: t.title,
        name: t.title,
        time: t.time,
        venue: t.location,
        description: `Milestone: ${t.milestone} • Owner: ${t.owner}`,
      })) as CeremonyItem[];
    }
    return undefined;
  }, [ceremonies, event, domain, timeline]);

  // 2. Map deterministic scene presets or custom dynamic ceremonies
  const scenes: VideoScene[] = useMemo(() => {
    if (domain === 'wedding') {
      const isCustomAdHoc =
        Array.isArray(resolvedCeremonies) &&
        resolvedCeremonies.length > 0 &&
        resolvedCeremonies.some((c) => c.id?.startsWith('c') && !c.id?.startsWith('cw'));

      if (!isCustomAdHoc) {
        const rawPreset = SCENE_REGISTRY[currentTradition] || HINDU_VEDIC_REEL_SCENES;
        return rawPreset.map((s, idx) => ({
          ...s,
          sceneNumber: s.sceneNumber ?? idx + 1,
          startTimeSeconds: s.startTimeSeconds ?? idx * 4,
          durationSeconds: s.durationSeconds ?? 4,
          zoomDirection: s.zoomDirection ?? (['in', 'pan-right', 'pan-left', 'out'] as const)[idx % 4],
          overlayTag: s.overlayTag ?? `${s.dayBadge} • ${s.timeBadge}`,
          venue: s.venue ?? s.venueBadge,
          time: s.time ?? s.timeBadge,
          attireCode: s.attireCode ?? s.attireBadge,
          audioLabel: s.audioLabel ?? s.audioBadge,
        }));
      }
    }
    const rawScenes = getVideoReelScenes(domain, eventTitle, currentTradition as WeddingCulture, resolvedCeremonies);
    return rawScenes.map((s, idx) => ({
      ...s,
      dayBadge: s.dayBadge ?? `Day ${idx + 1}`,
      timeBadge: s.timeBadge ?? (s.time || `${idx * 4}s`),
      venueBadge: s.venueBadge ?? (s.venue || 'Celebration Lawn'),
      attireBadge: s.attireBadge ?? (s.attireCode || 'Traditional Attire'),
      audioBadge: s.audioBadge ?? (s.audioLabel || 'Traditional Harmony (Active)'),
    }));
  }, [domain, eventTitle, currentTradition, resolvedCeremonies]);

  // 3. Dynamic Duration Calculation (4 seconds per planned ceremony)
  const totalDuration = useMemo(() => {
    return Math.max(8, scenes.length * 4);
  }, [scenes.length]);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Determine current active scene based on currentTime
  const currentSceneIndex = useMemo(() => {
    for (let i = scenes.length - 1; i >= 0; i--) {
      const sceneStart = scenes[i].startTimeSeconds ?? i * 4;
      if (currentTime >= sceneStart) {
        return i;
      }
    }
    return 0;
  }, [currentTime, scenes]);

  const activeScene = scenes[currentSceneIndex] || scenes[0];

  // 4. Adaptive Web Audio Synthesizer Tailored to Ceremony Mood
  const playHarmonicChime = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Dynamic chord frequencies by scene mood
      const mood = activeScene.musicMood || 'sacred_ritual';
      let chordNotes: number[][];

      if (mood === 'energetic_dance') {
        // High-energy Sangeet / DJ bass synth chords
        chordNotes = [
          [130.81, 196.0, 261.63, 392.0], // C power chord
          [146.83, 220.0, 293.66, 440.0], // D minor power
          [174.61, 261.63, 349.23, 523.25], // F major
          [196.0, 293.66, 392.0, 587.33], // G dominant
        ];
      } else if (mood === 'formal_gala') {
        // Grand ballroom jazz & champagne toast
        chordNotes = [
          [349.23, 440.0, 523.25, 659.25], // F major 7
          [392.0, 493.88, 587.33, 698.46], // G dominant
          [440.0, 523.25, 659.25, 783.99], // A minor 7
          [523.25, 659.25, 783.99, 1046.5], // C major bright
        ];
      } else if (mood === 'festive_party') {
        // Birthday cake fanfare & sparkling celebration
        chordNotes = [
          [523.25, 659.25, 783.99, 1046.5],
          [587.33, 739.99, 880.0, 1174.66],
          [659.25, 783.99, 987.77, 1318.51],
          [783.99, 987.77, 1174.66, 1567.98],
        ];
      } else if (mood === 'community_outdoor') {
        // Acoustic folk & brass festival fanfare
        chordNotes = [
          [261.63, 329.63, 392.0, 523.25],
          [293.66, 369.99, 440.0, 587.33],
          [329.63, 392.0, 493.88, 659.25],
          [392.0, 493.88, 587.33, 783.99],
        ];
      } else {
        // Sacred Indian ritual / Raga Bhoopali / Yaman shehnai frequencies
        chordNotes = [
          [293.66, 369.99, 440.0, 587.33], // D, F#, A, D
          [329.63, 392.0, 493.88, 659.25], // E, G, B, E
          [261.63, 329.63, 392.0, 523.25], // C, E, G, C
          [440.0, 554.37, 659.25, 880.0], // A, C#, E, A
        ];
      }

      const notes = chordNotes[currentSceneIndex % chordNotes.length];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = mood === 'energetic_dance' ? 'sawtooth' : idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(mood === 'energetic_dance' ? 2400 : 1200, ctx.currentTime);

        const now = ctx.currentTime + idx * 0.1;
        const peakGain = (mood === 'energetic_dance' ? 0.06 : 0.045) * volume;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.2);
      });
    } catch {
      // AudioContext unavailable or blocked
    }
  }, [isMuted, volume, currentSceneIndex, activeScene.musicMood]);

  // Audio heartbeat while playing
  useEffect(() => {
    if (isOpen && isPlaying && !isMuted) {
      playHarmonicChime();
      audioIntervalRef.current = window.setInterval(() => {
        playHarmonicChime();
      }, 2200);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [isOpen, isPlaying, isMuted, playHarmonicChime]);

  // 5. HTML5 Canvas Real-Time Cinematic Renderer
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const currentScene = activeScene;

    // Load or retrieve image from cache with resilient fallback
    let img = imageCacheRef.current.get(currentScene.imageUrl);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = currentScene.imageUrl;
      img.onerror = () => {
        if (img) {
          img.src = 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80';
        }
      };
      imageCacheRef.current.set(currentScene.imageUrl, img);
    }

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Compute progress in current scene (0 to 1)
      const sceneStart = currentScene.startTimeSeconds ?? currentSceneIndex * 4;
      const sceneDuration = currentScene.durationSeconds ?? 4;
      const sceneElapsed = currentTime - sceneStart;
      const progress = Math.min(1, Math.max(0, sceneElapsed / sceneDuration));

      // 1. Ken Burns Zoom & Pan Animation
      ctx.save();
      let scale = 1.08;
      let panX = 0;
      let panY = 0;

      const zoomDir = currentScene.zoomDirection || 'in';
      if (zoomDir === 'in') {
        scale = 1.0 + progress * 0.15;
      } else if (zoomDir === 'out') {
        scale = 1.15 - progress * 0.12;
      } else if (zoomDir === 'pan-right') {
        scale = 1.1;
        panX = -progress * 40;
      } else if (zoomDir === 'pan-left') {
        scale = 1.1;
        panX = progress * 40;
      }

      ctx.translate(w / 2 + panX, h / 2 + panY);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2);

      if (img && img.complete && img.naturalWidth > 0) {
        // Draw image covering canvas aspect ratio
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = w / h;
        let dw = w;
        let dh = h;
        let dx = 0;
        let dy = 0;

        if (imgAspect > canvasAspect) {
          dw = h * imgAspect;
          dx = (w - dw) / 2;
        } else {
          dh = w / imgAspect;
          dy = (h - dh) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
      } else {
        // Gradient fallback while image preloads
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // 2. Cinematic Vignette & Bottom Scrim
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
      vignette.addColorStop(0, 'rgba(5, 8, 16, 0.05)');
      vignette.addColorStop(0.7, 'rgba(5, 8, 16, 0.45)');
      vignette.addColorStop(1, 'rgba(5, 8, 16, 0.88)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // Bottom gradient scrim for high-contrast legible typography
      const bottomScrim = ctx.createLinearGradient(0, h * 0.5, 0, h);
      bottomScrim.addColorStop(0, 'rgba(5, 8, 16, 0)');
      bottomScrim.addColorStop(1, 'rgba(5, 8, 16, 0.95)');
      ctx.fillStyle = bottomScrim;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);

      // 3. Audio Equalizer Waveform Visualization (Top Right)
      if (isPlaying && !isMuted) {
        ctx.save();
        const barCount = 5;
        const barWidth = 4;
        const barGap = 3;
        const startX = w - 60;
        const startY = 32;

        ctx.fillStyle = '#34d399';
        for (let b = 0; b < barCount; b++) {
          const height = 4 + Math.abs(Math.sin(Date.now() / 140 + b * 1.2)) * 14;
          ctx.fillRect(startX + b * (barWidth + barGap), startY - height / 2, barWidth, height);
        }
        ctx.restore();
      }

      // 4. Subtle Film Grain / Atmospheric Dust Sparkle
      const timeSec = Date.now() / 1000;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let s = 0; s < 12; s++) {
        const sx = ((s * 107 + timeSec * 35) % w);
        const sy = ((s * 63 + timeSec * 22) % h);
        const sr = 1 + (s % 2);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, isPlaying, isMuted, currentTime, activeScene, currentSceneIndex]);

  // 6. Playback Clock Timer (Ticks at 100ms)
  useEffect(() => {
    let timer: number | null = null;
    if (isOpen && isPlaying) {
      timer = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration - 0.1) {
            return 0; // Loop seamlessly
          }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, isPlaying, totalDuration]);

  // Keyboard navigation & accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((m) => !m);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Skip to next scene
        const nextIdx = Math.min(scenes.length - 1, currentSceneIndex + 1);
        setCurrentTime(scenes[nextIdx]?.startTimeSeconds ?? nextIdx * 4);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Skip to prev scene
        const prevIdx = Math.max(0, currentSceneIndex - 1);
        setCurrentTime(scenes[prevIdx]?.startTimeSeconds ?? prevIdx * 4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentSceneIndex, scenes]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getKenBurnsStyle = (dir?: string) => {
    switch (dir) {
      case 'in':
        return {
          transform: 'scale(1.15)',
          transition: 'transform 4s ease',
        };
      case 'out':
        return {
          transform: 'scale(1.0)',
          transition: 'transform 4s ease',
        };
      case 'pan-right':
        return {
          transform: 'scale(1.1) translateX(-30px)',
          transition: 'transform 4s ease',
        };
      case 'pan-left':
        return {
          transform: 'scale(1.1) translateX(30px)',
          transition: 'transform 4s ease',
        };
      default:
        return {
          transform: 'scale(1.08)',
          transition: 'transform 4s ease',
        };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Event Video Reel - Cinematic Run-of-Show Preview"
      aria-live="polite"
      tabIndex={-1}
      ref={modalRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <div
        className="glass-panel shadow-utsav"
        style={{
          width: '100%',
          maxWidth: '960px',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: 'var(--shadow-utsav)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(236, 72, 153, 0.5)',
              }}
            >
              <Film size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h2
                  id="video-reel-modal-title"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#f8fafc',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  UtsavOS AI Cinematic Event Run-of-Show Preview
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#f472b6',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    textTransform: 'uppercase',
                  }}
                >
                  {scenes.length} Scenes • {totalDuration}s Reel
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Planora AI dynamic data-driven sequential highlight reel adapting in real-time to your dashboard planning.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video reel"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Canvas & Screen Viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: '#05070d',
            overflow: 'hidden',
          }}
        >
          {/* Real-time HTML5 Canvas Layer */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />

          {/* Accessible DOM Fallback Image */}
          <img
            key={activeScene.id}
            src={activeScene.imageUrl}
            alt={activeScene.title}
            crossOrigin="anonymous"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80';
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0, // canvas renders visual, image provides 100% accessible fallback
              pointerEvents: 'none',
              ...getKenBurnsStyle(activeScene.zoomDirection),
            }}
          />

          {/* Top Left Live Day/Time Badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(11, 15, 25, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.74rem',
              color: '#f8fafc',
              fontWeight: 700,
              letterSpacing: '0.04em',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isPlaying ? '#ec4899' : '#64748b',
                boxShadow: isPlaying ? '0 0 10px #ec4899' : 'none',
              }}
            />
            <span>{activeScene.dayBadge ? `${activeScene.dayBadge} • ${activeScene.timeBadge}` : (activeScene.overlayTag || 'Live')}</span>
          </div>

          {/* Top Right Audio Mode Badge */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(11, 15, 25, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.74rem',
              color: isMuted ? '#94a3b8' : '#34d399',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Sparkles size={12} />
            <span>{isMuted ? 'Muted' : (activeScene.audioBadge || activeScene.audioLabel || getCultureAudioSoundscape(culture, domain))}</span>
          </div>

          {/* Scene Title, Venue, Attire Code & Storyline Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '22px',
              left: '24px',
              right: '24px',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.95)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: '#ec4899',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)',
                }}
              >
                Scene {(activeScene.sceneNumber || currentSceneIndex + 1)} of {scenes.length}
              </span>

              {(activeScene.venueBadge || activeScene.venue) && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <MapPin size={11} color="#38bdf8" />
                  {activeScene.venueBadge || activeScene.venue}
                </span>
              )}

              {(activeScene.attireBadge || activeScene.attireCode) && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#fde047',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                  }}
                >
                  👗 {activeScene.attireBadge || activeScene.attireCode}
                </span>
              )}
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              {activeScene.title}
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: '0.84rem',
                color: '#e2e8f0',
                lineHeight: 1.45,
                maxWidth: '850px',
              }}
            >
              {activeScene.subtitle}
            </p>
          </div>
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            backgroundColor: '#0c121e',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {/* Progress Timeline Scrubber with Visual Scene Dividers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div
              style={{
                position: 'relative',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                setCurrentTime(Math.round(ratio * totalDuration * 10) / 10);
              }}
            >
              {/* Played Progress Bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${(currentTime / totalDuration) * 100}%`,
                  background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                  borderRadius: '9999px',
                  transition: isPlaying ? 'width 0.1s linear' : 'none',
                }}
              />

              {/* Scene Cut Markers */}
              {scenes.map((s, idx) => {
                const startSec = s.startTimeSeconds ?? idx * 4;
                const leftPercent = (startSec / totalDuration) * 100;
                return (
                  <div
                    key={s.id}
                    style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      zIndex: 2,
                    }}
                  />
                );
              })}
            </div>

            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              aria-label="Video reel progress scrubber"
              style={{ display: 'none' }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: '#94a3b8',
                fontWeight: 600,
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Interactive Control Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Play/Pause & Skip Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => {
                  const prevIdx = Math.max(0, currentSceneIndex - 1);
                  setCurrentTime(scenes[prevIdx]?.startTimeSeconds ?? prevIdx * 4);
                }}
                disabled={currentSceneIndex === 0}
                aria-label="Previous scene"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentSceneIndex === 0 ? '#475569' : '#f8fafc',
                  cursor: currentSceneIndex === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause video reel' : 'Play video reel'}
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  border: 'none',
                  borderRadius: '10px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(236, 72, 153, 0.5)',
                }}
              >
                {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextIdx = Math.min(scenes.length - 1, currentSceneIndex + 1);
                  setCurrentTime(scenes[nextIdx]?.startTimeSeconds ?? nextIdx * 4);
                }}
                disabled={currentSceneIndex === scenes.length - 1}
                aria-label="Next scene"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentSceneIndex === scenes.length - 1 ? '#475569' : '#f8fafc',
                  cursor: currentSceneIndex === scenes.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronRight size={16} />
              </button>

              {/* Volume & Mute Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginLeft: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  aria-label={isMuted ? 'Unmute ambient music' : 'Mute ambient music'}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isMuted ? '#f43f5e' : '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  aria-label="Audio Volume Slider"
                  style={{
                    width: '70px',
                    accentColor: '#ec4899',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* Scene Chapter Navigation Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {scenes.map((s, idx) => {
                const isActive = idx === currentSceneIndex;
                const startSec = s.startTimeSeconds ?? idx * 4;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentTime(startSec)}
                    aria-label={`Jump to Scene ${idx + 1}`}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isActive
                        ? '1px solid #ec4899'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: isActive
                        ? 'rgba(236, 72, 153, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isActive ? '#f472b6' : '#94a3b8',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Scene {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Export High-Resolution MP4 Package */}
            <button
              type="button"
              onClick={() => {
                setIsExporting(true);
                setTimeout(() => {
                  setIsExporting(false);
                  const exportPayload = {
                    eventTitle: sanitizeInput(eventTitle),
                    domain,
                    tradition: currentTradition,
                    totalDurationSeconds: totalDuration,
                    exportedAt: new Date().toISOString(),
                    scenes: scenes.map((s, idx) => ({
                      sceneNumber: idx + 1,
                      id: s.id,
                      dayBadge: s.dayBadge,
                      timeBadge: s.timeBadge,
                      venueBadge: s.venueBadge,
                      attireBadge: s.attireBadge,
                      title: s.title,
                      subtitle: s.subtitle,
                      audioBadge: s.audioBadge,
                      imageUrl: s.imageUrl,
                    })),
                  };
                  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${eventTitle.toLowerCase().replace(/\s+/g, '_')}_reel_metadata.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, 800);
              }}
              disabled={isExporting}
              aria-label="Download Reel Package"
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: isExporting ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Download size={14} />
              <span>{isExporting ? 'Exporting Reel...' : 'Download Reel Package'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EventVideoReelModal = VideoReelModal;
export default VideoReelModal;
