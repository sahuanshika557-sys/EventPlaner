import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Film,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Download,
  ChevronRight,
  ChevronLeft,
  X,
  Music,
  ShieldCheck,
} from 'lucide-react';
import type {
  ReelEventType,
  IndianCulture,
  ReelLanguage,
  ReelStyle,
  WeddingFunction,
  CommunityType,
  ReelSceneData,
  CreativeBrief,
  CulturalConsistencyReport,
  WeddingInputs,
  BirthdayInputs,
  CommunityInputs,
  ReelGeneratorInput,
  GenerationStepState,
} from '../../types/reelStudio';
import {
  getCultureProfile,
  generateDynamicStoryboard,
  validateCulturalConsistency,
  evaluateImageQualityGate,
} from '../../utils/cultureProfileEngine';
import {
  runReelGenerationPipeline,
  activeDemoProvider,
  activeLiveAIProvider,
  type RenderMode,
} from '../../services/aiProviders';

function downloadReelPackage(briefTitle: string, payload: Record<string, unknown>) {
  const fullPayload = {
    ...payload,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(fullPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${briefTitle.replace(/\s+/g, '_')}_AI_Reel_Package.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface AIReelStudioProps {
  initialEventType?: ReelEventType;
  initialCulture?: IndianCulture;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export const AIReelStudio: React.FC<AIReelStudioProps> = ({
  initialEventType = 'wedding',
  initialCulture = 'punjabi',
  onClose,
  isStandalonePage = false,
}) => {
  // --------------------------------------------------------------------------
  // 1. PRIMARY INPUT FORM STATE
  // --------------------------------------------------------------------------
  const [eventType, setEventType] = useState<ReelEventType>(initialEventType);
  const [culture, setCulture] = useState<IndianCulture>(initialCulture);
  const [language, setLanguage] = useState<ReelLanguage>('hindi');
  const [style, setStyle] = useState<ReelStyle>('cinematic');

  // Wedding Details
  const [weddingDetails, setWeddingDetails] = useState<WeddingInputs>({
    brideName: 'Ananya Sharma',
    groomName: 'Kabir Oberoi',
    weddingDate: '2026-11-18',
    venue: 'Taj Lake Palace Courtyard',
    city: 'Udaipur, Rajasthan',
    selectedFunctions: ['mehndi', 'haldi', 'sangeet', 'baraat', 'wedding_ceremony', 'reception'],
    guestCount: 350,
    theme: 'Royal Rajputi & Marigold Splendor',
    mood: 'Sacred & Joyous',
    musicPreference: 'Live Dholak & Traditional Shehnai Beats',
    specialMessage: 'Two families unite in an eternal bond of love.',
    uploadedPhotos: [],
  });

  // Birthday Details
  const [birthdayDetails, setBirthdayDetails] = useState<BirthdayInputs>({
    birthdayPersonName: 'Aarav Malhotra',
    age: 21,
    date: '2026-12-05',
    venue: 'Skyline Terrace Lounge',
    city: 'Mumbai, Maharashtra',
    theme: 'Royal',
    mood: 'Glamorous & Celebratory',
    musicPreference: 'Uplifting Celebratory & Modern Beats',
    specialMessage: 'May your 21st year bring infinite adventures and joy!',
    uploadedPhotos: [],
  });

  // Community Details
  const [communityDetails, setCommunityDetails] = useState<CommunityInputs>({
    eventName: 'Utsav Sanskritik Mahotsav',
    eventDate: '2026-10-15',
    venue: 'Heritage Community Center & Amphitheatre',
    city: 'Bengaluru, Karnataka',
    communityType: 'Cultural Gathering',
    mainActivities: 'Folk dance showcase, community feast, and honoring elders',
    theme: 'Celebrating Heritage & United Generations',
    mood: 'Uplifting & Inspiring',
    musicPreference: 'Traditional Folk & Collective Anthems',
    specialMessage: 'Together, our culture thrives and builds our legacy.',
    uploadedPhotos: [],
  });

  // --------------------------------------------------------------------------
  // 2. STORYBOARD, BRIEF & GENERATION STATE
  // --------------------------------------------------------------------------
  const [brief, setBrief] = useState<CreativeBrief>(() =>
    generateDynamicStoryboard({
      eventType: initialEventType,
      culture: initialCulture,
      language: 'hindi',
      style: 'cinematic',
      weddingDetails,
    }).brief
  );

  const [scenes, setScenes] = useState<ReelSceneData[]>(() =>
    generateDynamicStoryboard({
      eventType: initialEventType,
      culture: initialCulture,
      language: 'hindi',
      style: 'cinematic',
      weddingDetails,
    }).scenes
  );

  const [consistencyReport, setConsistencyReport] = useState<CulturalConsistencyReport>(() =>
    validateCulturalConsistency(
      {
        eventType: initialEventType,
        culture: initialCulture,
        language: 'hindi',
        style: 'cinematic',
        weddingDetails,
      },
      scenes
    )
  );

  const [renderMode, setRenderMode] = useState<RenderMode>('DEMO RENDER');
  const [useRealAI, setUseRealAI] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStepState[]>([
    { stepNumber: 1, title: '01 — Understanding Event', status: 'pending' },
    { stepNumber: 2, title: '02 — Building Cultural Profile', status: 'pending' },
    { stepNumber: 3, title: '03 — Creating Storyboard', status: 'pending' },
    { stepNumber: 4, title: '04 — Generating Visuals', status: 'pending' },
    { stepNumber: 5, title: '05 — Creating Audio', status: 'pending' },
    { stepNumber: 6, title: '06 — Compositing Reel', status: 'pending' },
    { stepNumber: 7, title: '07 — Quality Check', status: 'pending' },
    { stepNumber: 8, title: '08 — Complete', status: 'pending' },
  ]);
  const [generationError, setGenerationError] = useState<{
    sceneIndex?: number;
    reason: string;
  } | null>(null);

  // --------------------------------------------------------------------------
  // 3. REEL PLAYER STATE
  // --------------------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 to 1
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [activeEditingSceneId, setActiveEditingSceneId] = useState<string | null>(null);
  const [activeExplanationSceneId, setActiveExplanationSceneId] = useState<string | null>(null);
  const [activeVisualExplanationId, setActiveVisualExplanationId] = useState<string | null>(null);
  const [isCultureLocked, setIsCultureLocked] = useState<boolean>(true);
  const [showConsistencyModal, setShowConsistencyModal] = useState<boolean>(false);
  const [showBriefModal, setShowBriefModal] = useState<boolean>(false);
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);

  const reelContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const activeScene = scenes[currentSceneIndex] || scenes[0];
  const activeProfile = getCultureProfile(culture);

  // --------------------------------------------------------------------------
  // 4. SYNTHESIZED CULTURAL AMBIENT AUDIO ENGINE
  // --------------------------------------------------------------------------
  const startAmbientAudio = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (oscillatorNodeRef.current) {
        try {
          oscillatorNodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch tuned to cultural mode
      const baseFreq =
        culture === 'tamil' || culture === 'south_indian' || culture === 'telugu'
          ? 220 // Carnatic Shadjam (A3)
          : culture === 'bengali'
          ? 261.63 // C4 Rabindra melodic
          : 196.0; // G3 Folk Dholak drone

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorNodeRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn('Audio synthesis initialized quietly:', e);
    }
  }, [culture, isMuted]);

  const stopAmbientAudio = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      try {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.1);
        setTimeout(() => {
          if (oscillatorNodeRef.current) {
            oscillatorNodeRef.current.stop();
            oscillatorNodeRef.current = null;
          }
        }, 120);
      } catch {
        // ignore
      }
    }
  }, []);

  // Sync audio with play/pause
  useEffect(() => {
    if (isPlaying && !isMuted) {
      startAmbientAudio();
    } else {
      stopAmbientAudio();
    }
    return () => stopAmbientAudio();
  }, [isPlaying, isMuted, startAmbientAudio, stopAmbientAudio]);

  // --------------------------------------------------------------------------
  // 5. PLAYBACK TIMER & SCENE ADVANCEMENT
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying || scenes.length === 0) return;

    const intervalMs = 100;
    const duration = (activeScene?.duration || 4) * 1000;
    const stepIncrement = intervalMs / duration;

    const timer = setInterval(() => {
      setSceneProgress((prev) => {
        if (prev + stepIncrement >= 1) {
          // Advance to next scene or loop
          setCurrentSceneIndex((idx) => {
            if (idx + 1 < scenes.length) {
              return idx + 1;
            }
            return 0; // loop
          });
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeScene, scenes.length]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept typing in input fields
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentSceneIndex((i) => Math.min(scenes.length - 1, i + 1));
        setSceneProgress(0);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSceneIndex((i) => Math.max(0, i - 1));
        setSceneProgress(0);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((m) => !m);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes.length]);

  // --------------------------------------------------------------------------
  // 6. PIPELINE RUNNER TRIGGER
  // --------------------------------------------------------------------------
  const handleGenerateReel = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setIsPlaying(false);

    const input: ReelGeneratorInput = {
      eventType,
      culture,
      language,
      style,
      weddingDetails: eventType === 'wedding' ? weddingDetails : undefined,
      birthdayDetails: eventType === 'birthday' ? birthdayDetails : undefined,
      communityDetails: eventType === 'community' ? communityDetails : undefined,
    };

    try {
      const result = await runReelGenerationPipeline(
        input,
        useRealAI,
        (stepIndex, title, detail, completed) => {
          setGenerationSteps((prev) =>
            prev.map((step) => {
              if (step.stepNumber === stepIndex) {
                return {
                  ...step,
                  title,
                  detailMessage: detail,
                  status: completed ? 'complete' : 'active',
                };
              }
              if (step.stepNumber < stepIndex) {
                return { ...step, status: 'complete' };
              }
              return step;
            })
          );
        }
      );

      setBrief(result.brief);
      setScenes(result.scenes);
      setConsistencyReport(result.consistency);
      setRenderMode(result.renderMode);
      setCurrentSceneIndex(0);
      setSceneProgress(0);

      // Auto play once ready
      setTimeout(() => {
        setIsGenerating(false);
        setIsPlaying(true);
      }, 700);
    } catch (err: unknown) {
      console.error('Reel generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Visual generation provider did not return a valid result.';
      setGenerationError({
        reason: errorMessage,
      });
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------------------------------
  // 7. SINGLE SCENE REGENERATION (ANTI-RELOAD ARCHITECTURE)
  // --------------------------------------------------------------------------
  const handleRegenerateSingleScene = async (sceneId: string) => {
    setRegeneratingSceneId(sceneId);
    const targetIdx = scenes.findIndex((s) => s.id === sceneId);
    if (targetIdx === -1) return;

    try {
      const targetScene = scenes[targetIdx];
      const provider = useRealAI ? activeLiveAIProvider : activeDemoProvider;
      const visual = await provider.generateSceneVisual(
        targetScene.visualPrompt,
        activeProfile.culturalElements
      );

      const qualityResult = evaluateImageQualityGate(
        visual.imageUrl,
        eventType,
        culture,
        targetScene.purpose
      );

      setScenes((prev) => {
        const copy = [...prev];
        copy[targetIdx] = {
          ...copy[targetIdx],
          imageUrl: visual.imageUrl,
          isUserPhoto: false,
          cultureMatchScore: Math.round(qualityResult.cultureMatch * 100),
          sceneMatchScore: Math.round(qualityResult.sceneMatch * 100),
          eventMatchScore: Math.round(qualityResult.eventMatch * 100),
          hasMismatch: !qualityResult.passed,
          whyThisVisual: `Regenerated & verified against ${activeProfile.cultureName} cultural constraints for ${targetScene.purpose}. ${qualityResult.reason}`,
        };
        return copy;
      });
    } catch (err) {
      console.warn('Single scene regeneration fallback:', err);
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  // --------------------------------------------------------------------------
  // 8. PHOTO UPLOAD HANDLER
  // --------------------------------------------------------------------------
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          if (eventType === 'wedding') {
            setWeddingDetails((w) => ({
              ...w,
              uploadedPhotos: [...w.uploadedPhotos, dataUrl],
            }));
          } else if (eventType === 'birthday') {
            setBirthdayDetails((b) => ({
              ...b,
              uploadedPhotos: [...b.uploadedPhotos, dataUrl],
            }));
          } else {
            setCommunityDetails((c) => ({
              ...c,
              uploadedPhotos: [...c.uploadedPhotos, dataUrl],
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // --------------------------------------------------------------------------
  // 9. EXPORT & DOWNLOAD PACKAGE
  // --------------------------------------------------------------------------
  const handleExportReelPackage = () => {
    downloadReelPackage(brief.title, {
      title: brief.title,
      eventType,
      culture: activeProfile.cultureName,
      language,
      style,
      renderMode,
      alignmentScore: `${consistencyReport.alignmentScore}%`,
      storyboard: scenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        title: s.title,
        caption: s.caption,
        voiceover: s.voiceover,
        imageUrl: s.imageUrl,
        duration: s.duration,
        purpose: s.purpose,
        musicCue: s.musicCue,
      })),
    });
  };

  // --------------------------------------------------------------------------
  // 10. RENDER
  // --------------------------------------------------------------------------
  return (
    <div
      style={{
        backgroundColor: '#0a0d18',
        color: '#f8fafc',
        minHeight: isStandalonePage ? '100vh' : 'auto',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
      className="ai-reel-studio-wrapper"
    >
      {/* Studio Header Bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0f1424',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(236, 72, 153, 0.4)',
            }}
          >
            <Film size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                UtsavOS AI Reel Studio
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  backgroundColor: renderMode === 'AI GENERATED RENDER' ? '#059669' : '#d97706',
                  color: '#ffffff',
                }}
              >
                {renderMode}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              Formula: Event Type + Culture + Language + Details + Style = Personalized Cinematic Reel
            </p>
          </div>
        </div>

        {/* Global Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Cultural Consistency Badge */}
          <button
            onClick={() => setShowConsistencyModal(true)}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            title="Click to view AI Cultural Consistency Check details"
          >
            <ShieldCheck size={14} />
            <span>Cultural Alignment: {consistencyReport.alignmentScore}%</span>
          </button>

          {/* Real AI vs Demo Render Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <input
              type="checkbox"
              checked={useRealAI}
              onChange={(e) => setUseRealAI(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Live AI Render Mode</span>
          </label>

          {/* Export Button */}
          <button
            onClick={handleExportReelPackage}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={14} />
            <span>Export Reel</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.3rem',
              }}
              aria-label="Close AI Reel Studio"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main 3-Column Studio Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) minmax(420px, 1fr) minmax(340px, 420px)',
          gap: '1rem',
          padding: '1rem',
          minHeight: 'calc(100vh - 75px)',
          alignItems: 'start',
        }}
        className="ai-reel-studio-grid"
      >
        {/* ================================================================= */}
        {/* COLUMN 1 (LEFT): THREE EVENT SWITCHER & SETUP FORM               */}
        {/* ================================================================= */}
        <section
          style={{
            backgroundColor: '#11162a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
          }}
          aria-label="Reel Configuration Panel"
        >
          {/* STEP 1: STRICT THREE EVENT CATEGORY SWITCHER */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              1. Event Category (Strict 3 Categories)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { type: 'wedding' as ReelEventType, label: '💍 Wedding', icon: '💍' },
                { type: 'birthday' as ReelEventType, label: '🎂 Birthday', icon: '🎂' },
                { type: 'community' as ReelEventType, label: '🤝 Community', icon: '🤝' },
              ].map((ev) => (
                <button
                  key={ev.type}
                  onClick={() => {
                    setEventType(ev.type);
                    // Dynamically update storyboard to match selected category
                    const gen = generateDynamicStoryboard({
                      eventType: ev.type,
                      culture,
                      language,
                      style,
                      weddingDetails: ev.type === 'wedding' ? weddingDetails : undefined,
                      birthdayDetails: ev.type === 'birthday' ? birthdayDetails : undefined,
                      communityDetails: ev.type === 'community' ? communityDetails : undefined,
                    });
                    setBrief(gen.brief);
                    setScenes(gen.scenes);
                    setConsistencyReport(gen.consistency);
                    setCurrentSceneIndex(0);
                    setSceneProgress(0);
                  }}
                  style={{
                    padding: '0.65rem 0.4rem',
                    borderRadius: '10px',
                    border:
                      eventType === ev.type
                        ? '2px solid #ec4899'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor:
                      eventType === ev.type ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  {ev.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: SCALABLE INDIAN CULTURE SELECTION & CULTURE LOCK */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              2. Indian Culture Profile
            </label>
            {isCultureLocked ? (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>🔒</span>
                    <span style={{ color: '#34d399', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.02em' }}>
                      CULTURE LOCKED ({activeProfile.cultureName})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCultureLocked(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#f8fafc',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Change Culture
                  </button>
                </div>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.35 }}>
                  All generated scenes follow the <strong>{activeProfile.cultureName}</strong> profile.
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#facc15' }}>
                    Select Indian Cultural Profile:
                  </span>
                  <button
                    onClick={() => setIsCultureLocked(true)}
                    style={{
                      background: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔒 Lock Culture
                  </button>
                </div>
                <select
                  value={culture}
                  onChange={(e) => {
                    const newCulture = e.target.value as IndianCulture;
                    setCulture(newCulture);
                    setIsCultureLocked(true);
                    const gen = generateDynamicStoryboard({
                      eventType,
                      culture: newCulture,
                      language,
                      style,
                      weddingDetails: eventType === 'wedding' ? weddingDetails : undefined,
                      birthdayDetails: eventType === 'birthday' ? birthdayDetails : undefined,
                      communityDetails: eventType === 'community' ? communityDetails : undefined,
                    });
                    setBrief(gen.brief);
                    setScenes(gen.scenes);
                    setConsistencyReport(gen.consistency);
                    setCurrentSceneIndex(0);
                    setSceneProgress(0);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: '#1a2035',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="punjabi">Punjabi (Dhol, Anand Karaj, Phulkari, Chooda)</option>
                  <option value="bengali">Bengali (Topor, Shankha-Pola, Shubho Drishti, Dhak)</option>
                  <option value="gujarati">Gujarati (Garba, Dandiya, Panetar, Toran)</option>
                  <option value="rajasthani">Rajasthani (Rajputi Poshak, Ghoomar, Fort Mandap)</option>
                  <option value="marathi">Marathi (Nauvari Paithani, Mundavalya, Dhol-Tasha)</option>
                  <option value="tamil">Tamil (Kanjeevaram, Nadaswaram, Oonjal, Mallipoo)</option>
                  <option value="telugu">Telugu (Dharmavaram, Talambralu, Jeelakarra Bellam)</option>
                  <option value="kannada">Kannada (Mysore Silk, Dhare Heroyodu, Peta)</option>
                  <option value="malayalam">Malayalam (Kasavu Gold, Nilavilakku, Chenda Melam)</option>
                  <option value="kashmiri">Kashmiri (Pheran, Dejhoor, Santoor, Chinar Leaves)</option>
                  <option value="north_indian">North Indian (Classic Vedic, Crimson & Ivory Sherwani)</option>
                  <option value="south_indian">South Indian (Classic Dravidian Temple Grandeur)</option>
                  <option value="custom">Custom / Modern Pan-Indian Fusion Heritage</option>
                </select>
                <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#fde047', lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>Changing culture will regenerate affected visuals, audio and captions.</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: LANGUAGE SELECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                3. Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as ReelLanguage)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.6rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: '#1a2035',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi (हिंदी)</option>
                <option value="hinglish">Hinglish</option>
                <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="bengali">Bengali (বাংলা)</option>
                <option value="gujarati">Gujarati (ગુજરાતી)</option>
                <option value="marathi">Marathi (मराठी)</option>
                <option value="tamil">Tamil (தமிழ்)</option>
                <option value="telugu">Telugu (తెలుగు)</option>
                <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="malayalam">Malayalam (മലയാളം)</option>
              </select>
            </div>

            {/* STEP 4: REEL STYLE SELECTION */}
            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                4. Reel Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as ReelStyle)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.6rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: '#1a2035',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                }}
              >
                <option value="cinematic">Cinematic (Slow, Emotional)</option>
                <option value="traditional">Traditional (Ritual-First)</option>
                <option value="energetic">Energetic (Fast Cuts, Dance)</option>
                <option value="emotional">Emotional (Heartfelt Family)</option>
                <option value="modern">Modern (Minimalist Chic)</option>
              </select>
            </div>
          </div>

          {/* STEP 5: CATEGORY SPECIFIC INPUT FIELDS */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>
                {eventType === 'wedding'
                  ? '💍 Wedding Details'
                  : eventType === 'birthday'
                  ? '🎂 Birthday Details'
                  : '🤝 Community Details'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Dynamic Fields</span>
            </div>

            {/* WEDDING INPUTS */}
            {eventType === 'wedding' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Bride Name</label>
                    <input
                      type="text"
                      value={weddingDetails.brideName}
                      onChange={(e) =>
                        setWeddingDetails({ ...weddingDetails, brideName: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Groom Name</label>
                    <input
                      type="text"
                      value={weddingDetails.groomName}
                      onChange={(e) =>
                        setWeddingDetails({ ...weddingDetails, groomName: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Venue & City</label>
                    <input
                      type="text"
                      value={weddingDetails.venue}
                      onChange={(e) =>
                        setWeddingDetails({ ...weddingDetails, venue: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Wedding Date</label>
                    <input
                      type="date"
                      value={weddingDetails.weddingDate}
                      onChange={(e) =>
                        setWeddingDetails({ ...weddingDetails, weddingDate: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>

                {/* Wedding Functions Multi-Select */}
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                    Select Wedding Functions (AI adapts storyboard):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                    {(
                      [
                        { id: 'mehndi', label: 'Mehndi' },
                        { id: 'haldi', label: 'Haldi' },
                        { id: 'sangeet', label: 'Sangeet' },
                        { id: 'baraat', label: 'Baraat' },
                        { id: 'wedding_ceremony', label: 'Vows / Pheras' },
                        { id: 'reception', label: 'Reception' },
                      ] as { id: WeddingFunction; label: string }[]
                    ).map((fn) => {
                      const isChecked = weddingDetails.selectedFunctions.includes(fn.id);
                      return (
                        <button
                          key={fn.id}
                          type="button"
                          onClick={() => {
                            const updated = isChecked
                              ? weddingDetails.selectedFunctions.filter((f) => f !== fn.id)
                              : [...weddingDetails.selectedFunctions, fn.id];
                            setWeddingDetails({ ...weddingDetails, selectedFunctions: updated });
                          }}
                          style={{
                            padding: '0.35rem 0.2rem',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: isChecked
                              ? '1px solid #ec4899'
                              : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: isChecked ? 'rgba(236,72,153,0.25)' : 'transparent',
                            color: isChecked ? '#f472b6' : '#94a3b8',
                          }}
                        >
                          {isChecked ? '✓ ' : ''}
                          {fn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* BIRTHDAY INPUTS */}
            {eventType === 'birthday' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Birthday Person Name</label>
                    <input
                      type="text"
                      value={birthdayDetails.birthdayPersonName}
                      onChange={(e) =>
                        setBirthdayDetails({
                          ...birthdayDetails,
                          birthdayPersonName: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Age</label>
                    <input
                      type="number"
                      value={birthdayDetails.age}
                      onChange={(e) =>
                        setBirthdayDetails({
                          ...birthdayDetails,
                          age: parseInt(e.target.value) || 21,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Birthday Theme</label>
                    <select
                      value={birthdayDetails.theme}
                      onChange={(e) =>
                        setBirthdayDetails({ ...birthdayDetails, theme: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    >
                      <option value="Royal">Royal Elegance</option>
                      <option value="Bollywood">Bollywood Glam</option>
                      <option value="Floral">Floral Garden</option>
                      <option value="Minimal">Minimal Aesthetic</option>
                      <option value="Party">Neon Party Craze</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Venue</label>
                    <input
                      type="text"
                      value={birthdayDetails.venue}
                      onChange={(e) =>
                        setBirthdayDetails({ ...birthdayDetails, venue: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* COMMUNITY INPUTS */}
            {eventType === 'community' && (
              <>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Community / Event Name</label>
                  <input
                    type="text"
                    value={communityDetails.eventName}
                    onChange={(e) =>
                      setCommunityDetails({ ...communityDetails, eventName: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: '#1a2035',
                      color: '#fff',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Community Type</label>
                    <select
                      value={communityDetails.communityType}
                      onChange={(e) =>
                        setCommunityDetails({
                          ...communityDetails,
                          communityType: e.target.value as CommunityType,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    >
                      <option value="Cultural Gathering">Cultural Gathering</option>
                      <option value="Society Celebration">Society Celebration</option>
                      <option value="Local Celebration">Local Celebration</option>
                      <option value="Community Festival">Community Festival</option>
                      <option value="Cultural Program">Cultural Program</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Main Activities</label>
                    <input
                      type="text"
                      value={communityDetails.mainActivities}
                      onChange={(e) =>
                        setCommunityDetails({ ...communityDetails, mainActivities: e.target.value })
                      }
                      placeholder="e.g. Folk dance, feast, honors"
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: '#1a2035',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* User Photo Upload Section */}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                Upload Personal Memories (Used organically in scenes):
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: '1px dashed rgba(255, 255, 255, 0.25)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                }}
              >
                <Upload size={14} />
                <span>Upload Photos (Couple, Venue, Family)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {/* Thumbnail previews */}
              {((eventType === 'wedding'
                ? weddingDetails.uploadedPhotos
                : eventType === 'birthday'
                ? birthdayDetails.uploadedPhotos
                : communityDetails.uploadedPhotos) || []).length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', overflowX: 'auto' }}>
                  {(eventType === 'wedding'
                    ? weddingDetails.uploadedPhotos
                    : eventType === 'birthday'
                    ? birthdayDetails.uploadedPhotos
                    : communityDetails.uploadedPhotos
                  ).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Memory ${i + 1}`}
                      style={{
                        width: '36px',
                        height: '36px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI CREATIVE BRIEF SUMMARY CARD */}
          <div
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '10px',
              padding: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
                AI Creative Brief
              </span>
              <button
                onClick={() => setShowBriefModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a855f7',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                View / Edit Brief
              </button>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              <strong>Your AI Story:</strong> {brief.storyConcept.slice(0, 115)}...
            </p>
          </div>

          {/* PRIMARY CALL-TO-ACTION BUTTON */}
          <button
            onClick={handleGenerateReel}
            disabled={isGenerating}
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 20px rgba(236, 72, 153, 0.35)',
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            <Sparkles size={18} />
            <span>{isGenerating ? 'Synthesizing AI Reel...' : 'Generate AI Event Reel'}</span>
          </button>
        </section>

        {/* ================================================================= */}
        {/* COLUMN 2 (CENTER): HERO VERTICAL 9:16 REEL PREVIEW                */}
        {/* ================================================================= */}
        <section
          ref={reelContainerRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0c1020',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.25rem',
            position: 'relative',
          }}
          aria-label="Cinematic Reel Hero Preview"
        >
          {/* Reel Aspect Ratio & Mode Bar */}
          <div
            style={{
              width: '100%',
              maxWidth: aspectRatio === '9:16' ? '360px' : '620px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                }}
              >
                Scene {currentSceneIndex + 1} of {scenes.length}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  color: '#cbd5e1',
                  fontWeight: 600,
                }}
              >
                {activeScene?.purpose?.toUpperCase() || 'SCENE'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => setAspectRatio(aspectRatio === '9:16' ? '16:9' : '9:16')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                {aspectRatio}
              </button>
              <button
                onClick={() => setIsMuted((m) => !m)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: isMuted ? '#f87171' : '#34d399',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                aria-label={isMuted ? 'Unmute ambient music' : 'Mute ambient music'}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{isMuted ? 'Muted' : 'Sound'}</span>
              </button>
            </div>
          </div>

          {/* 9:16 REEL PHONE-FRAME CONTAINER */}
          <div
            style={{
              width: '100%',
              maxWidth: aspectRatio === '9:16' ? '360px' : '620px',
              aspectRatio: aspectRatio === '9:16' ? '9/16' : '16/9',
              backgroundColor: '#000000',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(236, 72, 153, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {/* Background Visual with Dynamic Ken Burns Animation */}
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url('${activeScene?.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: isPlaying ? 'scale(1.08)' : 'scale(1.0)',
                transition: 'transform 4s ease-out',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />

            {/* Gradient Overlays for Readability */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.92) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Top Reel Metadata Bar */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
              }}
            >
              {/* Scene progress bars (Stories style) */}
              <div style={{ display: 'flex', gap: '4px', width: '100%', position: 'absolute', top: 0 }}>
                {scenes.map((s, idx) => (
                  <div
                    key={s.id}
                    style={{
                      height: '3px',
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width:
                          idx < currentSceneIndex
                            ? '100%'
                            : idx === currentSceneIndex
                            ? `${sceneProgress * 100}%`
                            : '0%',
                        backgroundColor: '#ffffff',
                        transition: idx === currentSceneIndex ? 'width 0.1s linear' : 'none',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Badges on top */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '10px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {activeScene?.dayBadge || `${activeProfile.cultureName}`}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(236, 72, 153, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.45rem',
                    borderRadius: '6px',
                  }}
                >
                  {activeScene?.timeBadge || 'Muhurtham'}
                </span>
              </div>

              <div style={{ marginTop: '10px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#facc15',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                  }}
                >
                  {renderMode}
                </span>
              </div>
            </div>

            {/* Bottom Dynamic Subtitles & Captions Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              {/* Audio Cue Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Music size={13} color="#f472b6" />
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#f472b6',
                    fontWeight: 600,
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {activeScene?.audioBadge || `${activeProfile.instruments[0]} Beats`}
                </span>
              </div>

              {/* Primary Cultural Caption */}
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.3,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
                }}
              >
                {activeScene?.caption}
              </h2>

              {/* Subtitle / Voiceover Snippet */}
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: '#e2e8f0',
                  lineHeight: 1.4,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
                }}
              >
                {activeScene?.subtitle}
              </p>

              {/* Why This Scene & Why This Visual Buttons in Reel */}
              <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveExplanationSceneId(
                      activeExplanationSceneId === activeScene.id ? null : activeScene.id
                    );
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <HelpCircle size={12} />
                  <span>Why this scene?</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVisualExplanationId(
                      activeVisualExplanationId === activeScene.id ? null : activeScene.id
                    );
                  }}
                  style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>👁 Why this visual?</span>
                </button>
              </div>

              {/* Explanatory Popover inside reel */}
              {activeExplanationSceneId === activeScene.id && (
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.72rem',
                    color: '#f8fafc',
                    lineHeight: 1.35,
                    marginTop: '0.3rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#f472b6' }}>
                      Cultural Engine Logic
                    </span>
                    <button
                      onClick={() => setActiveExplanationSceneId(null)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={{ margin: 0 }}>{activeScene?.whyThisScene}</p>
                </div>
              )}

              {/* Visual Explanation Popover in Center Reel */}
              {activeVisualExplanationId === activeScene.id && (
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.72rem',
                    color: '#f8fafc',
                    lineHeight: 1.35,
                    marginTop: '0.3rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                      Why this visual? ({activeProfile.cultureName})
                    </span>
                    <button
                      onClick={() => setActiveVisualExplanationId(null)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={{ margin: '0 0 0.35rem 0' }}>{activeScene?.whyThisVisual}</p>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', gap: '0.45rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.3rem' }}>
                    <span>Culture: <strong style={{ color: '#34d399' }}>{activeScene?.cultureMatchScore ?? 96}%</strong></span>
                    <span>Scene: <strong style={{ color: '#34d399' }}>{activeScene?.sceneMatchScore ?? 94}%</strong></span>
                    <span>Event: <strong style={{ color: '#34d399' }}>{activeScene?.eventMatchScore ?? 98}%</strong></span>
                    <span style={{ color: '#64748b' }}>(AI quality estimate)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Big Centered Play/Pause Tap Button */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isPlaying ? 0 : 0.95,
                transition: 'opacity 0.2s ease',
                zIndex: 20,
              }}
              aria-label={isPlaying ? 'Pause video reel' : 'Play video reel'}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
            </button>
          </div>

          {/* LARGE BOTTOM PLAYER CONTROLS (ACCESSIBILITY COMPLIANT) */}
          <div
            style={{
              width: '100%',
              maxWidth: aspectRatio === '9:16' ? '360px' : '620px',
              marginTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            {/* Timeline Scrubber */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="range"
                min="0"
                max={scenes.length - 1}
                step="0.01"
                value={currentSceneIndex + sceneProgress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const newIndex = Math.floor(val);
                  const newProg = val - newIndex;
                  setCurrentSceneIndex(newIndex);
                  setSceneProgress(newProg);
                }}
                aria-label="video reel progress scrubber"
                style={{
                  flex: 1,
                  accentColor: '#ec4899',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '45px', textAlign: 'right' }}>
                {Math.floor((currentSceneIndex * 4) + (sceneProgress * 4))}s / {scenes.length * 4}s
              </span>
            </div>

            {/* Transport Control Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={() => {
                    setCurrentSceneIndex(0);
                    setSceneProgress(0);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    padding: '0.45rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  title="Restart Reel"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  onClick={() => {
                    setCurrentSceneIndex((i) => Math.max(0, i - 1));
                    setSceneProgress(0);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    padding: '0.45rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  title="Previous Scene"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  aria-label={isPlaying ? 'Pause video reel' : 'Play video reel'}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentSceneIndex((i) => Math.min(scenes.length - 1, i + 1));
                    setSceneProgress(0);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    padding: '0.45rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  title="Next Scene"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Scene Navigation Chapter Buttons */}
              <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto' }}>
                {scenes.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSceneIndex(idx);
                      setSceneProgress(0);
                    }}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border:
                        currentSceneIndex === idx
                          ? '1px solid #ec4899'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor:
                        currentSceneIndex === idx ? 'rgba(236, 72, 153, 0.3)' : 'transparent',
                      color: currentSceneIndex === idx ? '#f472b6' : '#cbd5e1',
                    }}
                    aria-label={`Scene ${idx + 1}`}
                  >
                    Scene {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* COLUMN 3 (RIGHT): DYNAMIC STORYBOARD & SCENE EDITOR              */}
        {/* ================================================================= */}
        <section
          style={{
            backgroundColor: '#11162a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
          }}
          aria-label="Storyboard and Scene Editor"
        >
          {/* Header of Column 3 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>AI Storyboard ({scenes.length})</h2>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                Edit individual prompts, visuals & captions
              </p>
            </div>
            {/* Add Scene Button */}
            <button
              onClick={() => {
                const newNum = scenes.length + 1;
                const newScene: ReelSceneData = {
                  id: `custom-scene-${Date.now()}`,
                  sceneNumber: newNum,
                  title: `Scene ${newNum}: Additional Cultural Moment`,
                  duration: 4,
                  purpose: 'culture',
                  visualPrompt: `Authentic ${activeProfile.cultureName} celebration moment with traditional aesthetics.`,
                  videoPrompt: `Cinematic camera motion capturing joyful cultural interaction, 9:16 vertical view.`,
                  caption: `Cherished cultural memory — ${brief.title}`,
                  subtitle: `Moments of togetherness`,
                  voiceover: `Every tradition brings us closer in celebration and love.`,
                  culturalElements: [activeProfile.culturalElements[0]],
                  musicCue: activeProfile.musicStyle,
                  transition: 'dissolve',
                  cameraMotion: 'push-in',
                  imageUrl: activeProfile.palette[0] ? scenes[0]?.imageUrl : '',
                  dayBadge: 'Celebration Day',
                  timeBadge: 'Evening',
                  venueBadge: 'Celebration Stage',
                  attireBadge: activeProfile.traditionalAttire.split(';')[0],
                  audioBadge: 'Melodic Interlude',
                  whyThisScene: `User-added scene expanding the cultural narrative of ${brief.title}.`,
                  whyThisVisual: `Custom cultural scene adhering to ${activeProfile.cultureName} regional traditions.`,
                  cultureMatchScore: 95,
                  sceneMatchScore: 92,
                  eventMatchScore: 96,
                  hasMismatch: false,
                };
                setScenes([...scenes, newScene]);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Plus size={13} />
              <span>Add Scene</span>
            </button>
          </div>

          {/* List of Scenes in Storyboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {scenes.map((scene, idx) => {
              const isSelected = currentSceneIndex === idx;
              const isEditing = activeEditingSceneId === scene.id;

              return (
                <div
                  key={scene.id}
                  style={{
                    backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected
                      ? '1px solid rgba(236, 72, 153, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Scene Header */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Thumbnail */}
                    <div
                      onClick={() => {
                        setCurrentSceneIndex(idx);
                        setSceneProgress(0);
                      }}
                      style={{
                        width: '54px',
                        height: '72px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexShrink: 0,
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          padding: '1px 3px',
                          borderRadius: '3px',
                        }}
                      >
                        {scene.duration}s
                      </span>
                    </div>

                    {/* Scene Metadata */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: isSelected ? '#f472b6' : '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {scene.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                            color: '#94a3b8',
                          }}
                        >
                          {scene.purpose}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: '0.2rem 0 0',
                          fontSize: '0.7rem',
                          color: '#cbd5e1',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {scene.caption}
                      </p>

                      {/* Scene Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                        {/* Regenerate Scene */}
                        <button
                          onClick={() => handleRegenerateSingleScene(scene.id)}
                          disabled={regeneratingSceneId === scene.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#cbd5e1',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                          title="Regenerate visual for this scene only"
                        >
                          <RefreshCw
                            size={11}
                            style={{
                              animation:
                                regeneratingSceneId === scene.id ? 'spin 1s linear infinite' : 'none',
                            }}
                          />
                          <span>
                            {regeneratingSceneId === scene.id ? 'Rendering...' : 'Regen Visual'}
                          </span>
                        </button>

                        {/* Edit Scene Trigger */}
                        <button
                          onClick={() =>
                            setActiveEditingSceneId(isEditing ? null : scene.id)
                          }
                          style={{
                            background: isEditing ? '#ec4899' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <Edit3 size={11} />
                          <span>{isEditing ? 'Close' : 'Edit'}</span>
                        </button>

                        {/* Why This Scene Trigger */}
                        <button
                          onClick={() =>
                            setActiveExplanationSceneId(
                              activeExplanationSceneId === scene.id ? null : scene.id
                            )
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#a855f7',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <HelpCircle size={11} />
                          <span>Why?</span>
                        </button>

                        {/* Why This Visual Trigger */}
                        <button
                          onClick={() =>
                            setActiveVisualExplanationId(
                              activeVisualExplanationId === scene.id ? null : scene.id
                            )
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#38bdf8',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <span>👁 Why visual?</span>
                        </button>

                        {/* Delete Scene (if more than 3 scenes) */}
                        {scenes.length > 3 && (
                          <button
                            onClick={() => {
                              const updated = scenes.filter((s) => s.id !== scene.id);
                              setScenes(updated);
                              if (currentSceneIndex >= updated.length) {
                                setCurrentSceneIndex(updated.length - 1);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.65rem',
                              cursor: 'pointer',
                              padding: '0 0.2rem',
                            }}
                            title="Delete Scene"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>

                      {/* Cultural Match Indicator row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: '0.45rem',
                          fontSize: '0.64rem',
                          color: '#94a3b8',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '5px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span title="AI Quality Estimate: Cultural Profile Authenticity">
                          Culture Match: <strong style={{ color: (scene.cultureMatchScore ?? 96) >= 85 ? '#34d399' : '#f87171' }}>{scene.cultureMatchScore ?? 96}%</strong>
                        </span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span title="AI Quality Estimate: Scene Purpose Alignment">
                          Scene Match: <strong style={{ color: (scene.sceneMatchScore ?? 94) >= 80 ? '#34d399' : '#f87171' }}>{scene.sceneMatchScore ?? 94}%</strong>
                        </span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span title="AI Quality Estimate: Event Category Relevance">
                          Event Match: <strong style={{ color: (scene.eventMatchScore ?? 98) >= 85 ? '#34d399' : '#f87171' }}>{scene.eventMatchScore ?? 98}%</strong>
                        </span>
                        <span style={{ fontSize: '0.58rem', color: '#64748b' }}>(AI quality estimate)</span>
                      </div>

                      {/* Mismatch Warning Alert */}
                      {scene.hasMismatch && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '5px',
                            marginTop: '0.35rem',
                            fontSize: '0.68rem',
                            color: '#fca5a5',
                          }}
                        >
                          <span>⚠ Visual mismatch detected</span>
                          <button
                            onClick={() => handleRegenerateSingleScene(scene.id)}
                            style={{
                              background: '#ef4444',
                              border: 'none',
                              color: '#ffffff',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Explanation Box */}
                  {activeExplanationSceneId === scene.id && (
                    <div
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.7)',
                        borderLeft: '2px solid #a855f7',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.7rem',
                        color: '#e2e8f0',
                        marginTop: '0.5rem',
                        borderRadius: '0 4px 4px 0',
                      }}
                    >
                      <strong>Why this scene?</strong> {scene.whyThisScene}
                    </div>
                  )}

                  {/* Visual Explanation Box */}
                  {activeVisualExplanationId === scene.id && (
                    <div
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        borderLeft: '2px solid #38bdf8',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.7rem',
                        color: '#e2e8f0',
                        marginTop: '0.5rem',
                        borderRadius: '0 4px 4px 0',
                        lineHeight: 1.4,
                      }}
                    >
                      <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.2rem' }}>
                        Why this visual? ({activeProfile.cultureName})
                      </div>
                      <p style={{ margin: '0 0 0.3rem 0' }}>{scene.whyThisVisual || `Matches ${activeProfile.cultureName} cultural constraints for ${scene.purpose}.`}</p>
                      {scene.searchQuery && (
                        <div style={{ fontSize: '0.63rem', color: '#94a3b8' }}>
                          <strong>Visual Query:</strong> <code style={{ color: '#f472b6' }}>{scene.searchQuery}</code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INLINE SCENE EDITOR ACCORDION */}
                  {isEditing && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Caption Text</label>
                        <input
                          type="text"
                          value={scene.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setScenes((prev) =>
                              prev.map((s) => (s.id === scene.id ? { ...s, caption: val } : s))
                            );
                          }}
                          style={{
                            width: '100%',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: '#1a2035',
                            color: '#fff',
                            fontSize: '0.75rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Voiceover Script</label>
                        <textarea
                          rows={2}
                          value={scene.voiceover}
                          onChange={(e) => {
                            const val = e.target.value;
                            setScenes((prev) =>
                              prev.map((s) => (s.id === scene.id ? { ...s, voiceover: val } : s))
                            );
                          }}
                          style={{
                            width: '100%',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: '#1a2035',
                            color: '#fff',
                            fontSize: '0.75rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Visual Prompt</label>
                        <textarea
                          rows={2}
                          value={scene.visualPrompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setScenes((prev) =>
                              prev.map((s) => (s.id === scene.id ? { ...s, visualPrompt: val } : s))
                            );
                          }}
                          style={{
                            width: '100%',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: '#1a2035',
                            color: '#fff',
                            fontSize: '0.75rem',
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Duration (seconds)</label>
                          <input
                            type="number"
                            min="2"
                            max="10"
                            value={scene.duration}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 4;
                              setScenes((prev) =>
                                prev.map((s) => (s.id === scene.id ? { ...s, duration: val } : s))
                              );
                            }}
                            style={{
                              width: '100%',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              backgroundColor: '#1a2035',
                              color: '#fff',
                              fontSize: '0.75rem',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Camera Motion</label>
                          <select
                            value={scene.cameraMotion}
                            onChange={(e) => {
                              const val = e.target.value as ReelSceneData['cameraMotion'];
                              setScenes((prev) =>
                                prev.map((s) => (s.id === scene.id ? { ...s, cameraMotion: val } : s))
                              );
                            }}
                            style={{
                              width: '100%',
                              padding: '0.35rem',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              backgroundColor: '#1a2035',
                              color: '#fff',
                              fontSize: '0.75rem',
                            }}
                          >
                            <option value="push-in">Push-In</option>
                            <option value="pull-out">Pull-Out</option>
                            <option value="slow-pan-left">Slow Pan Left</option>
                            <option value="slow-pan-right">Slow Pan Right</option>
                            <option value="steady-orbit">Steady Orbit</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* 8-STEP GENERATION PIPELINE PROGRESS MODAL OVERLAY                    */}
      {/* ===================================================================== */}
      {isGenerating && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#0f1424',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '90%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(236, 72, 153, 0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  margin: '0 auto 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
                }}
              >
                <Sparkles size={24} color="#fff" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                Generating AI Event Reel
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Orchestrating {activeProfile.cultureName} cultural profiles, video scenes & audio cues
              </p>
            </div>

            {/* 8 Step List with Live Checks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {generationSteps.map((step) => {
                const isComplete = step.status === 'complete';
                const isActive = step.status === 'active';

                return (
                  <div
                    key={step.stepNumber}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isActive
                        ? 'rgba(236, 72, 153, 0.15)'
                        : isComplete
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isActive
                        ? '1px solid rgba(236, 72, 153, 0.35)'
                        : isComplete
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      {isComplete ? (
                        <CheckCircle2 size={18} color="#10b981" />
                      ) : isActive ? (
                        <RefreshCw
                          size={18}
                          color="#ec4899"
                          style={{ animation: 'spin 1s linear infinite' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: isComplete ? '#34d399' : isActive ? '#f472b6' : '#94a3b8',
                        }}
                      >
                        {step.title}
                      </div>
                      {step.detailMessage && (
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                          {step.detailMessage}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ERROR MODAL WITH ACTIONABLE RECOVERY                                 */}
      {/* ===================================================================== */}
      {generationError && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
        >
          <div
            style={{
              backgroundColor: '#161b2e',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '460px',
              width: '90%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertCircle size={24} color="#ef4444" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Scene Generation Failed</h2>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              <strong>Reason:</strong> {generationError.reason}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setGenerationError(null);
                  handleGenerateReel();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Retry Scene
              </button>
              <button
                onClick={() => {
                  setUseRealAI(false);
                  setGenerationError(null);
                  handleGenerateReel();
                }}
                style={{
                  background: '#ec4899',
                  border: 'none',
                  color: '#fff',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Use Demo Render
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CULTURAL CONSISTENCY AUDIT MODAL                                     */}
      {/* ===================================================================== */}
      {showConsistencyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#0f1424',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '560px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#10b981" />
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  Cultural Consistency Check
                </h2>
              </div>
              <button
                onClick={() => setShowConsistencyModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399' }}>
                Cultural Alignment: {consistencyReport.alignmentScore}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {consistencyReport.label}
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {consistencyReport.checks.map((chk) => (
                <div
                  key={chk.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>{chk.name}</span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0 1.4rem', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                    {chk.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CREATIVE BRIEF MODAL                                                 */}
      {/* ===================================================================== */}
      {showBriefModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#0f1424',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '560px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>AI Creative Brief</h2>
              <button
                onClick={() => setShowBriefModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Event Type</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{brief.eventType.toUpperCase()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Culture</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{brief.cultureName}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Language</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{brief.language.toUpperCase()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Style & Duration</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{brief.style.toUpperCase()} • {brief.durationSeconds}s</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Your AI Story Concept
                </label>
                <textarea
                  rows={3}
                  value={brief.storyConcept}
                  onChange={(e) => setBrief({ ...brief, storyConcept: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#1a2035',
                    color: '#fff',
                    fontSize: '0.8rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Emotional Arc
                </label>
                <input
                  type="text"
                  value={brief.emotionalArc}
                  onChange={(e) => setBrief({ ...brief, emotionalArc: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#1a2035',
                    color: '#fff',
                    fontSize: '0.8rem',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setShowBriefModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowBriefModal(false);
                  handleGenerateReel();
                }}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Generate Reel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReelStudio;
