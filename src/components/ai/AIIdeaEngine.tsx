import React, { useState } from 'react';
import type { AIConceptIdea, AIEngineParams } from '../../types/ai';
import type { EventDomain } from '../../types/event';
import { useAIIdeaEngine } from '../../hooks/useAIIdeaEngine';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  Palette,
  Lightbulb,
  Zap,
  Sliders,
  Plus,
  Star,
  Copy,
  Disc3,
  CalendarPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConceptImageViewer } from '../common/ConceptImageViewer';
import { FALLBACK_IMAGES } from '../../utils/aiImages';
import type { WeddingCulture } from '../../types/wedding';
import { generateEventIdeas, type StructuredEventPlan } from '../../services/aiService';
import { CateringMenuCard } from './CateringMenuCard';
import { ReturnGiftsCard } from './ReturnGiftsCard';

interface AIIdeaEngineProps {
  eventDomain: EventDomain;
  defaultTheme: string;
  guestCount: number;
  totalBudget?: number;
  culture?: WeddingCulture;
  onSaveConcept: (idea: AIConceptIdea) => void;
  onAddBudgetItem?: (item: { name: string; category: 'venue' | 'catering' | 'decor' | 'media' | 'contingency' | 'other'; estimatedCost: number; actualCost: number }) => void;
  onAddTimelineEntry?: (entry: { time: string; durationMinutes: number; title: string; owner: string; location: string; milestone: string; status: 'scheduled' }) => void;
}

export const AIIdeaEngine: React.FC<AIIdeaEngineProps> = ({
  eventDomain,
  defaultTheme,
  guestCount,
  totalBudget,
  culture,
  onSaveConcept,
  onAddBudgetItem,
  onAddTimelineEntry,
}) => {
  const { isGenerating, lastGeneratedIdea, generateIdeas } = useAIIdeaEngine();

  const [themeInput, setThemeInput] = useState(defaultTheme);
  const [demographicsInput, setDemographicsInput] = useState('Multi-generational, Families & Friends');
  const [budgetTier, setBudgetTier] = useState<AIEngineParams['budgetTier']>('Classic Elegance');
  const [venueEnvironment, setVenueEnvironment] = useState<AIEngineParams['venueEnvironment']>('Hybrid / Pavilion');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedSpecsId, setExpandedSpecsId] = useState<string | null>(null);
  const [structuredPlan, setStructuredPlan] = useState<StructuredEventPlan | null>(null);

  // Dynamically re-seed concepts whenever tradition or domain changes
  React.useEffect(() => {
    generateIdeas({
      eventType: eventDomain,
      theme: themeInput,
      guestCount,
      demographics: demographicsInput,
      budgetTier,
      venueEnvironment,
      culture,
    }).then((res) => {
      onSaveConcept(res);
    });

    generateEventIdeas({
      eventType: eventDomain,
      theme: themeInput,
      guestCount,
      totalBudget,
      culture,
      preferences: demographicsInput,
      budgetTier,
      venueEnvironment,
    }).then((planRes) => {
      if (planRes?.data) {
        setStructuredPlan(planRes.data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [culture, eventDomain]);

  const decorEstimatedCost = Math.round((totalBudget || 50000) * 0.15);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const [result, planRes] = await Promise.all([
      generateIdeas({
        eventType: eventDomain,
        theme: themeInput,
        guestCount,
        demographics: demographicsInput,
        budgetTier,
        venueEnvironment,
        culture,
      }),
      generateEventIdeas({
        eventType: eventDomain,
        theme: themeInput,
        guestCount,
        totalBudget,
        culture,
        preferences: demographicsInput,
        budgetTier,
        venueEnvironment,
      }),
    ]);

    onSaveConcept(result);
    if (planRes?.data) {
      setStructuredPlan(planRes.data);
    }

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ec4899', '#6366f1'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleCopyPalette = async (hexList: string[]) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(hexList.join(', '));
      }
    } catch {
      // safe fallback
    }
    setCopiedId('palette');
    setToastMessage(`Copied ${hexList.length} Theme Colors to Clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2500);
  };

  return (
    <section
      aria-label="UtsavOS GenAI Personalized Idea Engine"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Creative Studio Top Banner */}
      <div
        className="glass-panel shadow-utsav"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(236, 72, 153, 0.18) 100%)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-utsav)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF8C00, #F43F5E, #A855F7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(236, 72, 153, 0.4)',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
            Creative Concept Studio & UtsavOS Planora AI Engine
          </h2>
          <Badge variant="gold" size="sm">
            Planora AI Neural Engine
          </Badge>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: 0, maxWidth: '850px', lineHeight: 1.5 }}>
          Synthesizes custom color palettes with hex swatches, architectural lighting zones, interactive guest rituals, and entertainment playlist pacing tailored to {eventDomain}.
        </p>
      </div>

      {/* Parameter Controls Panel */}
      <form
        onSubmit={handleGenerate}
        className="glass-panel"
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
          <Sliders size={18} color="#818cf8" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Creative Parameters & Demographics
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Thematic Mood / Vision Prompt:
            </label>
            <input
              type="text"
              required
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder="e.g. Celestial Golden Starlight, Retro Neon Disco"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Target Guest Demographics:
            </label>
            <input
              type="text"
              value={demographicsInput}
              onChange={(e) => setDemographicsInput(e.target.value)}
              placeholder="e.g. Young adults 20-30s, families with children"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Budget Scale Tier:
            </label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as AIEngineParams['budgetTier'])}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="Intimate / Budget-Conscious">Intimate / Budget-Conscious</option>
              <option value="Classic Elegance">Classic Elegance</option>
              <option value="Luxury Grand Spectacle">Luxury Grand Spectacle</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Venue Environment:
            </label>
            <select
              value={venueEnvironment}
              onChange={(e) => setVenueEnvironment(e.target.value as AIEngineParams['venueEnvironment'])}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="Indoor Ballroom">Indoor Ballroom</option>
              <option value="Outdoor Garden/Park">Outdoor Garden / Park</option>
              <option value="Hybrid / Pavilion">Hybrid / Pavilion</option>
              <option value="Urban Loft">Urban Loft</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            id="btn-generate-ai-ideas"
            className="btn-primary-glow"
            disabled={isGenerating}
            style={{
              padding: '0.75rem 1.75rem',
              background: isGenerating
                ? '#4b5563'
                : 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={18} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Synthesizing Creative Matrix...' : 'Generate Unique Concepts'}</span>
          </button>
        </div>
      </form>

      {/* Animated Skeleton Shimmer State while Generating */}
      {isGenerating && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-panel shimmer-loading"
              style={{
                height: '320px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            />
          ))}
        </div>
      )}

      {/* Generated Creative Concept Display */}
      {!isGenerating && lastGeneratedIdea && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Generated Concept: {lastGeneratedIdea.decorConcept.themeTitle}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Generated at {lastGeneratedIdea.generatedAt}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* 1. Moodboard & Thematic Decor Concept Card */}
            <article
              className="glass-panel card-hover-lift animate-fade-in-up stagger-1"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Palette size={20} color="#ec4899" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    1. Moodboard & Tablescape Decor
                  </h4>
                </div>
                <Badge variant="neutral" size="sm">
                  {lastGeneratedIdea.decorConcept.estimatedBudgetImpact}
                </Badge>
              </div>

              {/* Dynamic Visual Concept Image */}
              <ConceptImageViewer
                src={lastGeneratedIdea.decorConcept.imageUrl || FALLBACK_IMAGES.decor[eventDomain]}
                fallbackSrc={FALLBACK_IMAGES.decor[eventDomain]}
                alt={lastGeneratedIdea.decorConcept.themeTitle}
                title="Moodboard & Tablescape Decor"
                promptText={lastGeneratedIdea.decorConcept.imagePrompt}
                colorPalette={lastGeneratedIdea.decorConcept.colorPalette}
              />

              {/* Color Palette Swatches */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Harmonious Color Palette:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyPalette(lastGeneratedIdea.decorConcept.colorPalette.map((c) => c.hex))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedId === 'palette' ? '#34d399' : '#818cf8',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: 0,
                    }}
                  >
                    <Copy size={11} /> {copiedId === 'palette' ? 'Copied!' : 'Copy Hex Codes'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {lastGeneratedIdea.decorConcept.colorPalette.map((col) => (
                    <div
                      key={col.hex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#090d16',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: col.hex,
                          display: 'inline-block',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>{col.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({col.hex})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tablescape & Centerpieces */}
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#f8fafc' }}>Tablescape & Linens:</strong>{' '}
                  <span style={{ color: '#94a3b8' }}>{lastGeneratedIdea.decorConcept.tablescapeDetails}</span>
                </div>
                <div>
                  <strong style={{ color: '#f8fafc' }}>Floral & Centerpieces:</strong>{' '}
                  <span style={{ color: '#94a3b8' }}>{lastGeneratedIdea.decorConcept.centerpieceConcept}</span>
                </div>
                <div>
                  <strong style={{ color: '#f8fafc' }}>Entrance Focal Point:</strong>{' '}
                  <span style={{ color: '#94a3b8' }}>{lastGeneratedIdea.decorConcept.entranceFocalPoint}</span>
                </div>
              </div>

              {onAddBudgetItem && (
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onAddBudgetItem({
                        name: 'Concept Decor & Floral Package (15% allocated)',
                        category: 'decor',
                        estimatedCost: decorEstimatedCost,
                        actualCost: 0,
                      });
                      setToastMessage('Added "Concept Decor & Floral Package (15% allocated)" to Budget Matrix!');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      backgroundColor: 'rgba(236, 72, 153, 0.18)',
                      border: '1px solid #ec4899',
                      borderRadius: '8px',
                      color: '#f472b6',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)',
                    }}
                  >
                    <Plus size={15} /> + Add Decor to Budget
                  </button>
                </div>
              )}
            </article>

            {/* 2. Lighting & Florals Scheme Card */}
            <article
              className="glass-panel card-hover-lift animate-fade-in-up stagger-2"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lightbulb size={20} color="#f59e0b" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    2. Lighting & Florals Scheme
                  </h4>
                </div>
                <Badge variant="warning" size="sm">
                  {lastGeneratedIdea.lightingSchematic.moodType}
                </Badge>
              </div>

              {/* Dynamic Visual Concept Image */}
              <ConceptImageViewer
                src={lastGeneratedIdea.lightingSchematic.imageUrl || FALLBACK_IMAGES.lighting[eventDomain]}
                fallbackSrc={FALLBACK_IMAGES.lighting[eventDomain]}
                alt={lastGeneratedIdea.lightingSchematic.name}
                title="Lighting & Florals Scheme"
                promptText={lastGeneratedIdea.lightingSchematic.imagePrompt}
                colorPalette={lastGeneratedIdea.decorConcept.colorPalette}
              />

              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fcd34d' }}>
                {lastGeneratedIdea.lightingSchematic.name}
              </div>

              {/* Zones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {lastGeneratedIdea.lightingSchematic.zones.map((zone, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#090d16',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span>Zone: {zone.zoneName}</span>
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>{zone.colorTemperature}</span>
                    </div>
                    <div style={{ color: '#cbd5e1' }}>Fixture: {zone.fixtureType}</div>
                    <div style={{ color: '#94a3b8', marginTop: '0.2rem' }}>{zone.instructions}</div>
                  </div>
                ))}
              </div>

              {/* Entertainment Pacing & Playlist Cue */}
              <div
                style={{
                  backgroundColor: '#090d16',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                }}
              >
                <Disc3 size={16} color="#818cf8" />
                <span>
                  <strong>Suggested Audio Pacing:</strong> Acoustic Lounge (Warm-up) → Up-tempo Funk (Mid-event) → High-Energy Anthems (Peak).
                </span>
              </div>
            </article>

            {/* 3. Signature Guest Experiences Card */}
            <article
              className="glass-panel card-hover-lift animate-fade-in-up stagger-3"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} color="#38bdf8" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    3. Signature Guest Experiences
                  </h4>
                </div>
                <Badge variant="info" size="sm">
                  {lastGeneratedIdea.engagementIdeas.length} Curated Rituals
                </Badge>
              </div>

              {/* Dynamic Visual Concept Image */}
              <ConceptImageViewer
                src={lastGeneratedIdea.engagementIdeas[0]?.imageUrl || FALLBACK_IMAGES.experience[eventDomain]}
                fallbackSrc={FALLBACK_IMAGES.experience[eventDomain]}
                alt={lastGeneratedIdea.engagementIdeas[0]?.title || 'Signature Experience'}
                title="Signature Guest Experience"
                promptText={lastGeneratedIdea.engagementIdeas[0]?.imagePrompt}
                colorPalette={lastGeneratedIdea.decorConcept.colorPalette}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {lastGeneratedIdea.engagementIdeas.map((eng) => (
                  <div
                    key={eng.id}
                    style={{
                      backgroundColor: '#090d16',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{eng.title}</strong>
                      {/* Clickable Rating Badge for Operational Vendor Equipment Specs */}
                      <button
                        type="button"
                        onClick={() => setExpandedSpecsId(expandedSpecsId === eng.id ? null : eng.id)}
                        aria-expanded={expandedSpecsId === eng.id}
                        aria-label={`Toggle operational vendor equipment specs for ${eng.title}`}
                        style={{
                          background: 'rgba(253, 224, 71, 0.12)',
                          border: '1px solid rgba(253, 224, 71, 0.35)',
                          borderRadius: '6px',
                          padding: '0.2rem 0.55rem',
                          color: '#fde047',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Star size={11} fill="#fde047" />
                        <span>★ {eng.engagementFactor}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {expandedSpecsId === eng.id ? '▲ Hide Specs' : '▼ Vendor Specs'}
                        </span>
                      </button>
                    </div>

                    <div style={{ color: '#38bdf8', fontSize: '0.75rem' }}>
                      Format: {eng.format} • Audience: {eng.targetDemographic}
                    </div>

                    <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.4 }}>
                      {eng.description}
                    </p>

                    {/* Operational Vendor Equipment & Logistics Specs Drawer */}
                    {expandedSpecsId === eng.id && (
                      <div
                        className="vendor-specs-accordion"
                        style={{
                          backgroundColor: '#050811',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginTop: '0.35rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          animation: 'fadeIn 0.2s ease-in',
                        }}
                      >
                        <div style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>⚙️ Operational Vendor Equipment & Logistics Specs:</span>
                        </div>
                        <div style={{ color: '#cbd5e1' }}>
                          <strong>🔌 Power Requirement:</strong> 1x dedicated 110V/220V 15A outlet within 15ft (or battery pack)
                        </div>
                        <div style={{ color: '#cbd5e1' }}>
                          <strong>🪑 Staging & Furniture:</strong> Vintage vanity table, velvet armchair & runner
                        </div>
                        <div style={{ color: '#cbd5e1' }}>
                          <strong>📋 Signage & Instructions:</strong> Framed chalkboard instructions with simple 3-step prompt
                        </div>
                        <div style={{ color: '#cbd5e1' }}>
                          <strong>📀 Deliverable:</strong> Post-event digital master & vinyl keepsake audio pressing
                        </div>
                        {eng.executionSteps && eng.executionSteps.length > 0 && (
                          <div style={{ marginTop: '0.25rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <strong style={{ color: '#94a3b8' }}>Execution Steps:</strong>
                            <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0, color: '#94a3b8' }}>
                              {eng.executionSteps.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {onAddTimelineEntry && (
                      <button
                        type="button"
                        onClick={() => {
                          onAddTimelineEntry({
                            time: '04:00 PM',
                            durationMinutes: 45,
                            title: eng.title,
                            owner: 'Experience Host',
                            location: 'Central Pavilion',
                            milestone: 'Interactive Ritual',
                            status: 'scheduled',
                          });
                          setToastMessage(`Added "${eng.title}" to Day-of Run-of-Show!`);
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <CalendarPlus size={11} /> Add to Timeline
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </article>

            {/* 4. Artisanal Catering & Banquet Menu Card */}
            {structuredPlan && <CateringMenuCard menu={structuredPlan.menu} />}

            {/* 5. Return Gifts & Keepsakes Card */}
            {structuredPlan && (
              <ReturnGiftsCard
                returnGifts={structuredPlan.returnGifts}
                budgetOptimizations={structuredPlan.budgetOptimizations}
                guestCount={guestCount}
                onAddBudgetItem={onAddBudgetItem}
                onSetToastMessage={(msg) => setToastMessage(msg || null)}
              />
            )}
          </div>
        </div>
      )}

      {/* Welcome / Starter CTA State */}
      {!isGenerating && !lastGeneratedIdea && (
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899',
            }}
          >
            <Sparkles size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.4rem' }}>
              Creative Concepts Ready to Generate
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, maxWidth: '540px' }}>
              Adjust parameters above or click below to synthesize custom color palettes, architectural lighting plans, and signature rituals with high-resolution visual moodboards.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            className="btn-primary-glow"
            style={{
              padding: '0.65rem 1.5rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.5rem',
            }}
          >
            <Sparkles size={16} /> Synthesize Concepts Now
          </button>
        </div>
      )}

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(52, 211, 153, 0.5)',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            color: '#34d399',
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
};
