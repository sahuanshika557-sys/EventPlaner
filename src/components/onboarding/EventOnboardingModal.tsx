import React, { useState } from 'react';
import type { EventDomain, EventModel } from '../../types/event';
import { generateAutoScheduleMilestones } from '../../utils/time';
import { createDefaultVendorsFromTemplate } from '../../data/vendorTemplates';
import { Modal } from '../common/Modal';
import { Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: EventModel) => void;
}

export const EventOnboardingModal: React.FC<EventOnboardingModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [domain, setDomain] = useState<EventDomain>('wedding');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [date, setDate] = useState('2026-12-15');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [totalBudget, setTotalBudget] = useState<number>(45000);
  const [currency, setCurrency] = useState('USD');

  // Handle Domain Selection & Set Sensible Defaults
  const handleSelectDomain = (selectedDomain: EventDomain) => {
    setDomain(selectedDomain);
    if (selectedDomain === 'wedding') {
      setTitle('Siddharth & Rhea’s Royal Wedding');
      setTagline('A celebration of eternal love, vibrant traditions & modern elegance');
      setLocation('The Grand Palace Gardens');
      setGuestCount(200);
      setTotalBudget(50000);
    } else if (selectedDomain === 'birthday') {
      setTitle('Maya’s 18th Neon Horizon Birthday Bash');
      setTagline('An unforgettable milestone night with live music & cosmic desserts');
      setLocation('Skyline Rooftop Lounge');
      setGuestCount(50);
      setTotalBudget(6500);
    } else {
      setTitle('Greenwood Park Community Harvest Fair');
      setTagline('Uniting families through sustainable arts, farm-to-table food & live music');
      setLocation('Greenwood Memorial Civic Park');
      setGuestCount(800);
      setTotalBudget(25000);
    }
    setStep(2);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate T-90, T-60, T-30, T-7 milestones
    const autoMilestones = generateAutoScheduleMilestones(date, domain);

    // Auto-generate domain-specific vendor templates
    const autoVendors = createDefaultVendorsFromTemplate(domain);

    // Auto-generate clean category-wise budget items
    const defaultBudgetItems = [
      { id: `b_${Date.now()}_1`, name: 'Primary Venue & Site Rental', category: 'venue' as const, estimatedCost: Math.round(totalBudget * 0.35), actualCost: Math.round(totalBudget * 0.35), isPaid: false },
      { id: `b_${Date.now()}_2`, name: 'Banquet & Food Beverage Service', category: 'catering' as const, estimatedCost: Math.round(totalBudget * 0.30), actualCost: Math.round(totalBudget * 0.28), isPaid: false },
      { id: `b_${Date.now()}_3`, name: 'Theme Decor & Floral Design', category: 'decor' as const, estimatedCost: Math.round(totalBudget * 0.15), actualCost: Math.round(totalBudget * 0.15), isPaid: false },
      { id: `b_${Date.now()}_4`, name: 'Photography & Cinematography Media', category: 'media' as const, estimatedCost: Math.round(totalBudget * 0.10), actualCost: Math.round(totalBudget * 0.10), isPaid: false },
      { id: `b_${Date.now()}_5`, name: 'Weather & Emergency Contingency Buffer', category: 'contingency' as const, estimatedCost: Math.round(totalBudget * 0.10), actualCost: 0, isPaid: false },
    ];

    const newEvent: EventModel = {
      id: `${domain}_custom_${Date.now()}`,
      domain,
      title: title.trim() || `${domain.toUpperCase()} Celebration`,
      tagline: tagline.trim() || 'A beautifully planned special event with UtsavOS',
      date,
      location: location.trim() || 'Private Venue',
      guestCount: Number(guestCount) || 100,
      totalBudget: Number(totalBudget) || 10000,
      currency,
      updatedAt: new Date().toISOString(),
      budgetItems: defaultBudgetItems,
      macroMilestones: autoMilestones,
      runOfShow: [
        {
          id: `ros_${Date.now()}_1`,
          time: '04:00 PM',
          durationMinutes: 60,
          endTime: '05:00 PM',
          title: 'Guest Check-In & Welcome Drinks',
          owner: 'Lead Coordinator',
          location: location || 'Main Entrance',
          milestone: 'Arrival & Welcome',
          status: 'scheduled',
          notes: 'Welcome mocktails and name tags ready.',
        },
        {
          id: `ros_${Date.now()}_2`,
          time: '05:30 PM',
          durationMinutes: 90,
          endTime: '07:00 PM',
          title: 'Main Celebration Ceremony & Speeches',
          owner: 'Host & MC',
          location: 'Stage Pavilion',
          milestone: 'Main Program',
          status: 'scheduled',
          notes: 'Audio microphone checks complete 30 mins prior.',
        },
      ],
      vendors: autoVendors,
      savedAIIdeas: [],
    };

    onCreateEvent(newEvent);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#d4af37'],
      });
    } catch {}

    onClose();
    setStep(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event in Under 1 Minute"
      maxWidth="580px"
    >
      <div>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { num: 1, label: 'Event Type' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Budget & Goals' },
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: step === s.num ? '#4f46e5' : step > s.num ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span style={{ fontSize: '0.78rem', color: step === s.num ? '#ffffff' : '#64748b', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: SELECT EVENT TYPE */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center' }}>
              What type of celebration are you organizing today?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleSelectDomain('wedding')}
                style={{
                  padding: '1.5rem 1rem',
                  backgroundColor: domain === 'wedding' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>💍</span>
                <strong style={{ fontSize: '1rem', color: '#f43f5e' }}>Luxury Wedding</strong>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Multi-day rituals, guest RSVP charts & banquet budgets.</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDomain('birthday')}
                style={{
                  padding: '1.5rem 1rem',
                  backgroundColor: domain === 'birthday' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>🎂</span>
                <strong style={{ fontSize: '1rem', color: '#8b5cf6' }}>Milestone Birthday</strong>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Games, custom cakes, party favors & party timelines.</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDomain('community')}
                style={{
                  padding: '1.5rem 1rem',
                  backgroundColor: domain === 'community' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>🤝</span>
                <strong style={{ fontSize: '1rem', color: '#10b981' }}>Community Festival</strong>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Permits, volunteer shifts, safety checklists & civic stage.</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="input-event-title" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Event Title *
              </label>
              <input
                id="input-event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="input-event-tagline" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Tagline or Vision
              </label>
              <input
                id="input-event-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="input-event-date" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Target Date *
                </label>
                <input
                  id="input-event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label htmlFor="input-guest-count" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Expected Guests *
                </label>
                <input
                  id="input-guest-count"
                  type="number"
                  min={1}
                  max={100000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-event-location" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Primary Venue / Location *
              </label>
              <input
                id="input-event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Next: Budget & Goals
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET & LAUNCH */}
        {step === 3 && (
          <form onSubmit={handleFinish} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="input-total-budget" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Total Budget Target *
                </label>
                <input
                  id="input-total-budget"
                  type="number"
                  min={0}
                  step={100}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label htmlFor="select-onboarding-currency" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Currency
                </label>
                <select
                  id="select-onboarding-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CAD">CAD (CA$)</option>
                </select>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                fontSize: '0.82rem',
                color: '#cbd5e1',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                ⚡ Auto-Configured by UtsavOS in Under 1 Minute:
              </strong>
              • Automatic T-90, T-60, T-30, T-7 milestone schedule calculated for {date}<br />
              • Domain-curated vendor partner templates with standard contract budgets<br />
              • Standard 35/30/15/10/10 budget allocation matrix seeded<br />
              • AI Cultural Intelligence engine ready for themes, menu, decor & return gifts
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                id="btn-create-event-finish"
                className="btn-primary-glow"
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Sparkles size={16} />
                <span>Launch {domain.toUpperCase()} Planner</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

