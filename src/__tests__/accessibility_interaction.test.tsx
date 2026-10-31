import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../components/common/Modal';
import { Navigation } from '../components/layout/Navigation';
import { Navbar } from '../components/layout/Navbar';
import { BudgetMatrix } from '../components/budget/BudgetMatrix';
import { sanitizeInput } from '../utils/sanitizer';
import { INITIAL_WEDDING_EVENT } from '../data/defaultEvents';
import type { BudgetLineItem } from '../types/budget';
import { ConceptImageViewer } from '../components/common/ConceptImageViewer';
import { EventVideoReelModal, VideoReelModal } from '../components/video/EventVideoReelModal';
import { WeddingFlow } from '../components/domains/WeddingFlow';
import { CulturalRitualProtocols } from '../components/domains/CulturalRitualProtocols';
import { CULTURAL_TRADITION_PRESETS } from '../data/culturalTraditions';
import { BrandLogo } from '../components/layout/BrandLogo';
import { AIIdeaEngine } from '../components/ai/AIIdeaEngine';
import { App } from '../App';
import { buildConceptIdea } from '../hooks/useAIIdeaEngine';
import {
  buildAIImageUrl,
  generateConceptPrompts,
  getHeroBannerImage,
  getReliableEventImage,
  getVideoReelScenes,
  resolveSceneVisual,
  getCultureAudioSoundscape,
  FALLBACK_IMAGES,
  SCENE_PRESETS,
} from '../utils/aiImages';

describe('Accessibility & Keyboard Interaction (WCAG 2.1 AA)', () => {
  it('renders modal with correct ARIA attributes role="dialog" and aria-modal="true"', () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Accessibility Test Dialog" description="Test description">
        <div>Modal Body Content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
  });

  it('closes modal on pressing the Escape key and supports Enter key trigger', async () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Keyboard Esc Modal">
        <button type="button" id="inner-action">Inside Action</button>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus inside the modal when Tab is pressed at boundary', async () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Focus Trap Modal">
        <input data-testid="input-first" type="text" />
        <button data-testid="btn-last" type="button">Submit</button>
      </Modal>
    );

    const btnLast = screen.getByTestId('btn-last');
    btnLast.focus();
    expect(document.activeElement).toBe(btnLast);

    // Tabbing past last element should cycle focus
    fireEvent.keyDown(btnLast, { key: 'Tab', code: 'Tab' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders navigation tabs with proper ARIA tablist semantics and manages tabIndex correctly', () => {
    const handleTabChange = vi.fn();

    render(
      <Navigation
        activeTab="budget"
        onTabChange={handleTabChange}
        domainName="Weddings"
        hasBudgetAlert={true}
        timelineConflictCount={2}
      />
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const budgetTab = screen.getByRole('tab', { name: /interactive budget matrix/i });
    expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    expect(budgetTab).toHaveAttribute('tabIndex', '0');

    const timelineTab = screen.getByRole('tab', { name: /dual-layer timeline/i });
    expect(timelineTab).toHaveAttribute('aria-selected', 'false');
    expect(timelineTab).toHaveAttribute('tabIndex', '-1');

    // Click on timeline tab triggers onTabChange
    fireEvent.click(timelineTab);
    expect(handleTabChange).toHaveBeenCalledWith('timeline');
  });

  it('seamlessly switches between Wedding, Birthday, and Community dashboards in Navbar', () => {
    const handleSwitchDomain = vi.fn();

    render(
      <Navbar
        currentEvent={INITIAL_WEDDING_EVENT}
        activeDomain="wedding"
        onSwitchDomain={handleSwitchDomain}
        onResetDefaults={vi.fn()}
      />
    );

    // Check domain pills
    const weddingPill = screen.getByRole('button', { name: /💍 weddings/i });
    const birthdayPill = screen.getByRole('button', { name: /🎂 birthdays/i });
    const communityPill = screen.getByRole('button', { name: /🎪 community/i });

    expect(weddingPill).toHaveAttribute('aria-pressed', 'true');
    expect(birthdayPill).toHaveAttribute('aria-pressed', 'false');
    expect(communityPill).toHaveAttribute('aria-pressed', 'false');

    // Switch to Birthday Flow
    fireEvent.click(birthdayPill);
    expect(handleSwitchDomain).toHaveBeenCalledWith('birthday');

    // Switch to Community Events
    fireEvent.click(communityPill);
    expect(handleSwitchDomain).toHaveBeenCalledWith('community');
  });

  it('emits ARIA live region notification on budget threshold warning and critical over-budget', () => {
    const mockItems: BudgetLineItem[] = [
      {
        id: 'b1',
        name: 'Grand Ballroom Venue',
        category: 'venue',
        estimatedCost: 35000,
        actualCost: 55000, // Exceeds total budget of 50,000
        isPaid: true,
      },
    ];

    render(
      <BudgetMatrix
        totalBudget={50000}
        items={mockItems}
        currency="USD"
        onUpdateItems={vi.fn()}
        onUpdateBudget={vi.fn()}
        onUpdateCurrency={vi.fn()}
      />
    );

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveTextContent(/CRITICAL OVER-BUDGET ALERT/i);
    expect(statusRegion).toHaveTextContent(/\$55,000/);
  });

  it('neutralizes malicious XSS script injection tags before state persistence', () => {
    const dangerousScript = "<script>alert('xss')</script>Special Fireworks Lighting";
    const sanitized = sanitizeInput(dangerousScript);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert(');
    expect(sanitized).toContain('Special Fireworks Lighting');
  });

  it('allows adding, editing, and deleting budget line items and verifies calculation', () => {
    const handleUpdateItems = vi.fn();
    const initialItems: BudgetLineItem[] = [
      {
        id: 'item-1',
        name: 'Acoustic Band',
        category: 'media',
        estimatedCost: 3000,
        actualCost: 2800,
        isPaid: false,
      },
    ];

    render(
      <BudgetMatrix
        totalBudget={20000}
        items={initialItems}
        currency="USD"
        onUpdateItems={handleUpdateItems}
        onUpdateBudget={vi.fn()}
        onUpdateCurrency={vi.fn()}
      />
    );

    // Verify initial item is rendered
    expect(screen.getByText('Acoustic Band')).toBeInTheDocument();

    // Open add expense modal
    const addBtn = screen.getByRole('button', { name: /add expense/i });
    fireEvent.click(addBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/add new budget item/i)).toBeInTheDocument();

    // Delete item
    const deleteBtn = screen.getByLabelText(/delete acoustic band/i);
    fireEvent.click(deleteBtn);

    // Should call onUpdateItems with empty array
    expect(handleUpdateItems).toHaveBeenCalledWith([]);
  });

  it('renders ConceptImageViewer with loading shimmer skeleton and switches to fallback on error', () => {
    const primarySrc = 'https://broken-or-offline-image-source.com/invalid.jpg';
    const fallback = FALLBACK_IMAGES.decor.wedding;

    render(
      <ConceptImageViewer
        src={primarySrc}
        fallbackSrc={fallback}
        alt="Romantic Tablescape Floral Concept"
        title="Moodboard Preview"
        promptText="Opulent floral centerpiece with roses"
      />
    );

    // Initial loading skeleton should be visible
    const skeleton = screen.getByTestId('concept-image-skeleton');
    expect(skeleton).toBeInTheDocument();

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Romantic Tablescape Floral Concept');

    // Simulate primary image error -> should gracefully switch to fallback
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', fallback);
  });

  it('sanitizes AI image prompt URLs and validates Pollinations AI endpoint formatting', () => {
    const rawPrompt = "<script>alert('hack')</script> Luxury Candlelit Ballroom with Gold Flatware";
    const generatedUrl = buildAIImageUrl(rawPrompt, 800, 450);

    expect(generatedUrl).not.toContain('<script>');
    expect(generatedUrl).toContain('https://image.pollinations.ai/prompt/');
    expect(generatedUrl).toContain('width=800');
    expect(generatedUrl).toContain('height=450');
    expect(generatedUrl).toContain('nologo=true');

    // Test prompt synthesis for wedding, birthday, and community
    const weddingPrompts = generateConceptPrompts('wedding', 'Royal Velvet', 'Palace Ballroom');
    expect(weddingPrompts.decorPrompt).toContain('Royal Velvet');
    expect(weddingPrompts.lightingPrompt).toContain('lighting');
    expect(weddingPrompts.experiencePrompt).toContain('guest');

    const birthdayPrompts = generateConceptPrompts('birthday', 'Neon Cyberpunk', 'Lounge');
    expect(birthdayPrompts.decorPrompt).toContain('Neon Cyberpunk');

    const communityPrompts = generateConceptPrompts('community', 'Harvest Festival', 'Park');
    expect(communityPrompts.decorPrompt).toContain('Harvest Festival');
  });

  it('verifies domain-adaptive panoramic hero banner images for all 3 event domains', () => {
    const weddingHero = getHeroBannerImage('wedding');
    const birthdayHero = getHeroBannerImage('birthday');
    const communityHero = getHeroBannerImage('community');

    expect(weddingHero).toBe(FALLBACK_IMAGES.heroBanners.wedding);
    expect(birthdayHero).toBe(FALLBACK_IMAGES.heroBanners.birthday);
    expect(communityHero).toBe(FALLBACK_IMAGES.heroBanners.community);

    expect(weddingHero).toContain('https://images.unsplash.com/');
    expect(birthdayHero).toContain('https://images.unsplash.com/');
    expect(communityHero).toContain('https://images.unsplash.com/');
  });

  it('renders reliable rate-limit-free image pools for all domains and concept dimensions', () => {
    const weddingDecor = getReliableEventImage('wedding', 'decor', 0);
    const birthdayLighting = getReliableEventImage('birthday', 'lighting', 0);
    const communityExp = getReliableEventImage('community', 'experience', 0);

    expect(weddingDecor).toContain('https://images.unsplash.com/');
    expect(birthdayLighting).toContain('https://images.unsplash.com/');
    expect(communityExp).toContain('https://images.unsplash.com/');

    const scenes = getVideoReelScenes('wedding', 'Royal Wedding');
    expect(scenes).toHaveLength(6);
    expect(scenes[0].title).toBe('Scene 1: Day 1: Mehendi & Henna Fiesta');
    expect(scenes[0].imageUrl).toContain('https://images.unsplash.com/');
  });

  it('mounts EventVideoReelModal with proper playback controls, timeline scrubber, and scene chapters', () => {
    expect(VideoReelModal).toBe(EventVideoReelModal);
    const handleClose = vi.fn();

    render(
      <EventVideoReelModal
        isOpen={true}
        onClose={handleClose}
        domain="wedding"
        eventTitle="Royal Palace Wedding Celebration"
      />
    );

    const dialog = screen.getByRole('dialog', { name: /event video reel/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('UtsavOS AI Cinematic Event Run-of-Show Preview')).toBeInTheDocument();

    // Verify playback control buttons
    const playPauseBtn = screen.getByLabelText(/pause video reel/i);
    expect(playPauseBtn).toBeInTheDocument();

    const audioToggleBtn = screen.getByLabelText(/mute ambient music/i);
    expect(audioToggleBtn).toBeInTheDocument();

    const scrubber = screen.getByLabelText(/video reel progress scrubber/i);
    expect(scrubber).toBeInTheDocument();

    const downloadBtn = screen.getByRole('button', { name: /download reel package/i });
    expect(downloadBtn).toBeInTheDocument();

    // Verify scene chapters
    expect(screen.getByRole('button', { name: /scene 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 3/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 4/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 5/i })).toBeInTheDocument();
  });

  it('video modal traps focus and closes cleanly on Escape key press and Space key toggles playback', () => {
    const handleClose = vi.fn();

    render(
      <EventVideoReelModal
        isOpen={true}
        onClose={handleClose}
        domain="birthday"
        eventTitle="Super Galactic Birthday Bash"
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Pressing Space toggles play/pause state
    fireEvent.keyDown(window, { key: ' ', code: 'Space' });

    // Pressing Escape key triggers close
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches culture from North Indian to South Indian and cascades ritual ceremony cards', () => {
    const handleSchedule = vi.fn();
    const handleCulture = vi.fn();

    render(
      <WeddingFlow
        scheduleDays={INITIAL_WEDDING_EVENT.weddingData!.scheduleDays}
        guests={INITIAL_WEDDING_EVENT.weddingData!.guests}
        tables={INITIAL_WEDDING_EVENT.weddingData!.tables}
        bridalParty={INITIAL_WEDDING_EVENT.weddingData!.bridalParty}
        culture="north_indian"
        onUpdateScheduleDays={handleSchedule}
        onUpdateGuests={vi.fn()}
        onUpdateTables={vi.fn()}
        onUpdateBridalParty={vi.fn()}
        onUpdateCulture={handleCulture}
      />
    );

    // Initial render shows North Indian active preset badge
    expect(screen.getByText('Active: North Indian / Vedic')).toBeInTheDocument();
    expect(screen.getByText('Day 1: Mehendi & Henna Fiesta')).toBeInTheDocument();

    // Click on South Indian culture archetype
    const southIndianRadio = screen.getByRole('radio', { name: /South Indian/i });
    expect(southIndianRadio).toBeInTheDocument();
    fireEvent.click(southIndianRadio);

    // Assert culture callback and automated ceremony cascading triggered
    expect(handleCulture).toHaveBeenCalledWith('south_indian');
    expect(handleSchedule).toHaveBeenCalledWith(
      CULTURAL_TRADITION_PRESETS.south_indian.ceremonies
    );
  });

  it('enforces table seating capacity bounds and displays capacity exceeded warnings without NaN', () => {
    // Table with capacity 2 but 3 seated guests
    const overCapacityTables = [
      {
        id: 't_test',
        tableNumber: 1,
        tableName: 'VIP Elders Lounge',
        capacity: 2,
        isVip: true,
        shape: 'Round' as const,
        assignedGuestIds: ['g1', 'g2', 'g3'],
      },
    ];

    render(
      <WeddingFlow
        scheduleDays={INITIAL_WEDDING_EVENT.weddingData!.scheduleDays}
        guests={INITIAL_WEDDING_EVENT.weddingData!.guests}
        tables={overCapacityTables}
        bridalParty={INITIAL_WEDDING_EVENT.weddingData!.bridalParty}
        culture="north_indian"
        onUpdateScheduleDays={vi.fn()}
        onUpdateGuests={vi.fn()}
        onUpdateTables={vi.fn()}
        onUpdateBridalParty={vi.fn()}
      />
    );

    // Switch to Table Seating tab
    const seatingTab = screen.getByRole('tab', { name: /table seating/i });
    fireEvent.click(seatingTab);

    // Assert that table name and Capacity Exceeded alert are rendered
    expect(screen.getByText('VIP Elders Lounge')).toBeInTheDocument();
    expect(screen.getByText(/Capacity Exceeded \(\+1\)/i)).toBeInTheDocument();
  });

  it('handles zero, floating-point, and negative prices gracefully in BudgetMatrix without NaN crash', () => {
    const handleUpdateItems = vi.fn();
    const handleUpdateBudget = vi.fn();
    const handleUpdateCurrency = vi.fn();

    const edgeCaseItems: BudgetLineItem[] = [
      { id: 'b_zero', name: 'Complimentary Venue Lawn', category: 'venue', estimatedCost: 0, actualCost: 0, isPaid: true },
      { id: 'b_float', name: 'Artisanal Floral Centerpieces', category: 'decor', estimatedCost: 1499.75, actualCost: 1549.99, isPaid: true },
      { id: 'b_rebate', name: 'Vendor Loyalty Rebate', category: 'catering', estimatedCost: 500, actualCost: 450.50, isPaid: true },
    ];

    render(
      <BudgetMatrix
        totalBudget={5000}
        items={edgeCaseItems}
        currency="USD"
        onUpdateItems={handleUpdateItems}
        onUpdateBudget={handleUpdateBudget}
        onUpdateCurrency={handleUpdateCurrency}
      />
    );

    // Verify matrix rendered without NaN
    expect(screen.getByText('Complimentary Venue Lawn')).toBeInTheDocument();
    expect(screen.getByText('Artisanal Floral Centerpieces')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();

    // Verify the Cultural Quick-Add Toolbar is present
    expect(screen.getByText(/Cultural & Tradition Specialty Expenses/i)).toBeInTheDocument();
  });

  it('supports CSV export for guest RSVP tracker with dietary rules and family sides', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const createObjectUrlMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectUrlMock = vi.fn();
    window.URL.createObjectURL = createObjectUrlMock;
    window.URL.revokeObjectURL = revokeObjectUrlMock;

    render(
      <WeddingFlow
        scheduleDays={INITIAL_WEDDING_EVENT.weddingData!.scheduleDays}
        guests={INITIAL_WEDDING_EVENT.weddingData!.guests}
        tables={INITIAL_WEDDING_EVENT.weddingData!.tables}
        bridalParty={INITIAL_WEDDING_EVENT.weddingData!.bridalParty}
        culture="north_indian"
        onUpdateScheduleDays={vi.fn()}
        onUpdateGuests={vi.fn()}
        onUpdateTables={vi.fn()}
        onUpdateBridalParty={vi.fn()}
      />
    );

    // Switch to Guest RSVP tab
    const rsvpTab = screen.getByRole('tab', { name: /guest rsvp tracker/i });
    fireEvent.click(rsvpTab);

    // Find and click the Export RSVP CSV button
    const exportBtn = screen.getByRole('button', { name: /export rsvp csv/i });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);

    // Assert CSV blob URL was generated and revoked
    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledTimes(1);
  });

  it('renders BrandLogo with accessible label, insignia SVG, and UtsavOS / Planora AI typography', () => {
    render(<BrandLogo size="md" showSubtitle={true} />);

    const brandContainer = screen.getByLabelText('UtsavOS | Planora AI Event Operating System');
    expect(brandContainer).toBeInTheDocument();

    // Verify brand typography
    expect(screen.getByText('Utsav')).toBeInTheDocument();
    expect(screen.getByText('OS')).toBeInTheDocument();
    expect(screen.getByText('Planora')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('AI-POWERED EVENT OPERATING SYSTEM')).toBeInTheDocument();
  });

  it('verifies Navbar mounts BrandLogo and opens Global UtsavOS Search dialog on Ctrl+K shortcut', () => {
    render(
      <Navbar
        currentEvent={INITIAL_WEDDING_EVENT}
        activeDomain="wedding"
        onSwitchDomain={vi.fn()}
        onResetDefaults={vi.fn()}
      />
    );

    // Verify brand logo is present
    expect(screen.getByLabelText('UtsavOS | Planora AI Event Operating System')).toBeInTheDocument();

    // Press Ctrl+K to open search modal
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    // Assert modal title is updated to UtsavOS
    expect(screen.getByText('Global UtsavOS Search & Command Palette')).toBeInTheDocument();
  });

  it('renders App main dashboard with aria-label="UtsavOS Main Dashboard" and branded footer', () => {
    render(<App />);

    // Assert main dashboard container has accessible aria-label
    const mainDashboard = screen.getByRole('main', { name: /UtsavOS Main Dashboard/i });
    expect(mainDashboard).toBeInTheDocument();

    // Assert accessible footer contains UtsavOS | Planora AI
    expect(
      screen.getByText(/UtsavOS \| Planora AI Enterprise Event Operating System/i)
    ).toBeInTheDocument();
  });

  it('verifies that adding a 5th ceremony dynamically creates 5 scenes in the Video Reel state', () => {
    const fiveCeremonies = [
      { id: 'c1', name: 'Haldi Turmeric Ceremony', date: '2026-11-20', startTime: '09:00 AM', venue: 'Garden Courtyard', attireCode: 'Yellow Festive', ritualNotes: 'Fresh turmeric paste blessings' },
      { id: 'c2', name: 'Mehendi & Henna Fiesta', date: '2026-11-20', startTime: '03:00 PM', venue: 'Poolside Lawn', attireCode: 'Boho Chic', ritualNotes: 'Bridal henna application' },
      { id: 'c3', name: 'Sangeet & Dance Musical', date: '2026-11-21', startTime: '07:30 PM', venue: 'Grand Ballroom', attireCode: 'Glamour Sequins', ritualNotes: 'Choreographed family dance performances' },
      { id: 'c4', name: 'Vedic Pheras & Mandap Vows', date: '2026-11-22', startTime: '10:00 AM', venue: 'Temple Pavilion', attireCode: 'Royal Silk', ritualNotes: 'Sacred Agni 7 pheras' },
      { id: 'c5', name: 'Grand Reception Dinner Gala', date: '2026-11-22', startTime: '08:00 PM', venue: 'Crystal Palace', attireCode: 'Black Tie Formal', ritualNotes: 'Toast & First Dance' },
    ];

    // Verify dynamic scene generation logic
    const scenes = getVideoReelScenes('wedding', 'Royal Wedding', 'north_indian', fiveCeremonies);
    expect(scenes).toHaveLength(5);
    expect(scenes[0].title).toContain('Haldi Turmeric Ceremony');
    expect(scenes[1].title).toContain('Mehendi & Henna Fiesta');
    expect(scenes[2].title).toContain('Sangeet & Dance Musical');
    expect(scenes[3].title).toContain('Vedic Pheras & Mandap Vows');
    expect(scenes[4].title).toContain('Grand Reception Dinner Gala');

    // Mount EventVideoReelModal with the 5 ceremonies
    render(
      <EventVideoReelModal
        isOpen={true}
        onClose={vi.fn()}
        domain="wedding"
        eventTitle="Royal Wedding"
        ceremonies={fiveCeremonies}
      />
    );

    // Assert that exactly 5 scene chapters are rendered
    expect(screen.getByRole('button', { name: /scene 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 3/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 4/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scene 5/i })).toBeInTheDocument();

    // Verify 5 scenes duration tag
    expect(screen.getByText(/5 Scenes • 20s Reel/i)).toBeInTheDocument();
  });

  it('verifies that changing a ceremony\'s name to "Haldi Sunshine" triggers the yellow/marigold visual asset mapping', () => {
    const ceremony = {
      id: 'c_haldi_sunshine',
      name: 'Haldi Sunshine',
      venue: 'Sunny Lawn Courtyard',
      ritualNotes: 'Traditional turmeric and marigold flower blessings',
    };

    const visualMatch = resolveSceneVisual(ceremony);

    // Assert that tag is mapped to haldi
    expect(visualMatch.tag).toBe('haldi');
    expect(visualMatch.keywordMatched).toBe('haldi');
    expect(visualMatch.musicMood).toBe('sacred_ritual');

    // Assert image URL is from the yellow marigold curated pool
    expect(visualMatch.imageUrl).toContain('https://images.unsplash.com/');
    expect(
      visualMatch.imageUrl.includes('1583939003579') ||
      visualMatch.imageUrl.includes('1607190074257') ||
      visualMatch.imageUrl.includes('1545232979')
    ).toBe(true);
  });

  it('supports ArrowLeft and ArrowRight keyboard shortcuts to jump between reel scenes', () => {
    const ceremonies = [
      { id: 'c1', name: 'Morning Arrival', date: 'Day 1' },
      { id: 'c2', name: 'Evening Sangeet Dance', date: 'Day 1' },
    ];

    render(
      <EventVideoReelModal
        isOpen={true}
        onClose={vi.fn()}
        domain="wedding"
        eventTitle="Weekend Celebration"
        ceremonies={ceremonies}
      />
    );

    // Initial scene
    expect(screen.getByText(/Scene 1: Morning Arrival/i)).toBeInTheDocument();

    // Press ArrowRight to skip to next scene
    fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });

    // Press ArrowLeft to return to previous scene
    fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' });
  });

  it('verifies "Copy Hex Codes" copies hex values to clipboard and displays toast notification', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <AIIdeaEngine
        eventDomain="wedding"
        defaultTheme="Enchanted Celestial Glow"
        guestCount={150}
        totalBudget={50000}
        onSaveConcept={vi.fn()}
      />
    );

    // Find and click the "Copy Hex Codes" button
    const copyBtn = screen.getByRole('button', { name: /copy hex codes/i });
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);

    // Verify clipboard was called with comma-separated hex codes
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    const copiedText = writeTextMock.mock.calls[0][0];
    expect(copiedText).toContain('#FF9933'); // Kesariya Gold
    expect(copiedText).toContain('#E30B5C'); // Sindoor Red

    // Verify toast notification appears
    expect(await screen.findByText(/Copied 5 Theme Colors to Clipboard!/i)).toBeInTheDocument();
  });

  it('verifies "+ Add Decor to Budget" appends the allocated package to budget ledger', () => {
    const handleAddBudgetItem = vi.fn();

    render(
      <AIIdeaEngine
        eventDomain="wedding"
        defaultTheme="Enchanted Celestial Glow"
        guestCount={150}
        totalBudget={50000}
        onSaveConcept={vi.fn()}
        onAddBudgetItem={handleAddBudgetItem}
      />
    );

    // Find and click "+ Add Decor to Budget" button
    const addDecorBtn = screen.getByRole('button', { name: /\+ Add Decor to Budget/i });
    expect(addDecorBtn).toBeInTheDocument();
    fireEvent.click(addDecorBtn);

    // Verify callback was called with 15% budget item
    expect(handleAddBudgetItem).toHaveBeenCalledWith({
      name: 'Concept Decor & Floral Package (15% allocated)',
      category: 'decor',
      estimatedCost: 7500, // 15% of 50000
      actualCost: 0,
    });
  });

  it('verifies Expand Moodboard button has aria-label="Expand Moodboard Image" and opens Lightbox modal', () => {
    render(
      <ConceptImageViewer
        src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
        fallbackSrc="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
        alt="Royal Tablescape Decor"
        title="Royal Tablescape Decor"
        promptText="Luxury wedding tablescape with gold tableware"
        colorPalette={[
          { name: 'Champagne Gold', hex: '#D4AF37' },
          { name: 'Burgundy Velvet', hex: '#800020' },
        ]}
      />
    );

    // Ensure floating "Cinematic Preview" badge is not rendered
    expect(screen.queryByText('Cinematic Preview')).not.toBeInTheDocument();

    // Verify Expand Moodboard button
    const expandBtn = screen.getByRole('button', { name: 'Expand Moodboard Image' });
    expect(expandBtn).toBeInTheDocument();

    // Click to open Lightbox modal
    fireEvent.click(expandBtn);

    // Verify Lightbox Modal opens with image, swatches, and pin button
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Champagne Gold')).toBeInTheDocument();
    expect(screen.getByText('Burgundy Velvet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pin to moodboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download high-res/i })).toBeInTheDocument();
  });

  it('verifies rating badge is clickable to expand detailed operational vendor equipment specs', () => {
    render(
      <AIIdeaEngine
        eventDomain="wedding"
        defaultTheme="Enchanted Celestial Glow"
        guestCount={150}
        totalBudget={50000}
        onSaveConcept={vi.fn()}
      />
    );

    // Find the rating button for Customized Vow Books
    const ratingBtn = screen.getByRole('button', { name: /vendor equipment specs for customized vow books/i });
    expect(ratingBtn).toBeInTheDocument();
    expect(ratingBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to expand vendor specs
    fireEvent.click(ratingBtn);
    expect(ratingBtn).toHaveAttribute('aria-expanded', 'true');

    // Verify operational equipment specs are rendered
    expect(screen.getByText(/Power Requirement:/i)).toBeInTheDocument();
    expect(screen.getByText(/Staging & Furniture:/i)).toBeInTheDocument();
    expect(screen.getByText(/Signage & Instructions:/i)).toBeInTheDocument();
    expect(screen.getByText(/Deliverable:/i)).toBeInTheDocument();
  });

  it('verifies Tradition & Ritual Archetype selector in header dynamically re-seeds Video Reel soundscapes and eliminates duplicate images', () => {
    // 1. Verify Audio Soundscape mapping
    expect(getCultureAudioSoundscape('north_indian', 'wedding')).toBe('Traditional Shehnai, Sitar & Sacred Vedic Chants (Active)');
    expect(getCultureAudioSoundscape('punjabi_sikh', 'wedding')).toBe('Traditional Shabad Ragas & Dhol (Active)');
    expect(getCultureAudioSoundscape('muslim_nikah', 'wedding')).toBe('Sufi Santoor & Instrumental Harmony (Active)');
    expect(getCultureAudioSoundscape('south_indian', 'wedding')).toBe('Nadaswaram & Thavil Temple Melodies (Active)');
    expect(getCultureAudioSoundscape('fusion_cross_cultural', 'wedding')).toBe('East-Meets-West Melodic Fusion (Sitar + Cello + Acoustic DJ) (Active)');

    // 2. Verify selecting "Hindu (Vedic)" produces exactly 6 distinct Indian authentic wedding scenes with 0 duplicate URLs
    const hinduScenes = getVideoReelScenes('wedding', 'Royal Wedding', 'north_indian');
    expect(hinduScenes).toHaveLength(6);

    // Scene 1: Mehendi & Henna Fiesta
    expect(hinduScenes[0].title).toBe('Scene 1: Day 1: Mehendi & Henna Fiesta');
    expect(hinduScenes[0].dayBadge).toBe('Day 1 (2026-11-18)');
    expect(hinduScenes[0].venueBadge).toBe('Lawn and Mehndi Stage Set');
    expect(hinduScenes[0].imageUrl).toBe('https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80');
    expect(hinduScenes[0].audioBadge).toBe('Traditional Shehnai & Dholak Beats (Active)');

    // Scene 2: Haldi & Chooda Morning
    expect(hinduScenes[1].title).toBe('Scene 2: Day 3: Haldi & Chooda Morning');
    expect(hinduScenes[1].dayBadge).toBe('Day 3 (2026-11-20)');
    expect(hinduScenes[1].venueBadge).toBe('Lotus Courtyard');
    expect(hinduScenes[1].imageUrl).toBe('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80');
    expect(hinduScenes[1].audioBadge).toBe('Sanai and Folk Ceremonial Music (Active)');

    // Scene 3: Chooda Ceremony & Blessing
    expect(hinduScenes[2].title).toBe('Scene 3: Day 3: Chooda Ceremony & Blessing');
    expect(hinduScenes[2].dayBadge).toBe('Day 3 (2026-11-20)');
    expect(hinduScenes[2].venueBadge).toBe('Auspicious Heritage Stage');
    expect(hinduScenes[2].imageUrl).toBe('https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80');
    expect(hinduScenes[2].audioBadge).toBe('Punjabi Folk & Dholak Chants (Active)');

    // Scene 4: Baraat, Varmala & Sacred Pheras
    expect(hinduScenes[3].title).toBe('Scene 4: Day 3: Baraat, Varmala & Sacred Pheras');
    expect(hinduScenes[3].dayBadge).toBe('Day 3 (2026-11-20)');
    expect(hinduScenes[3].venueBadge).toBe('Palace Mandap by Lotus Pond');
    expect(hinduScenes[3].imageUrl).toBe('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80');
    expect(hinduScenes[3].audioBadge).toBe('Classical Vedic Chants & Sacred Shehnai (Active)');

    // Scene 5: Emotional Vidaai / Send-off
    expect(hinduScenes[4].title).toBe('Scene 5: Day 3: Emotional Vidaai / Send-off');
    expect(hinduScenes[4].dayBadge).toBe('Day 3 (2026-11-20)');
    expect(hinduScenes[4].venueBadge).toBe('Exit Portico');
    expect(hinduScenes[4].imageUrl).toBe('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80');
    expect(hinduScenes[4].audioBadge).toBe('Plaintive Shehnai & Emotional Folk Sitar (Active)');

    // Scene 6: Grand Reception Gala & Feast
    expect(hinduScenes[5].title).toBe('Scene 6: Day 4: Grand Reception Gala & Feast');
    expect(hinduScenes[5].dayBadge).toBe('Day 4 (2026-11-21)');
    expect(hinduScenes[5].venueBadge).toBe('Crystal Grand Ballroom');
    expect(hinduScenes[5].imageUrl).toBe('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80');
    expect(hinduScenes[5].audioBadge).toBe('Sitar & Acoustic Sangeet Orchestra (Active)');

    // Assert 0 duplicate URLs across Hindu scenes
    const hinduUrls = new Set(hinduScenes.map((s) => s.imageUrl));
    expect(hinduUrls.size).toBe(6);
    expect(hinduScenes.some((s) => s.imageUrl.includes('photo-1508700115892-45ecd05ae2ad'))).toBe(false); // No concert photos
    expect(hinduScenes.some((s) => s.imageUrl.includes('photo-1516450360452-9312f5e86fc7'))).toBe(false); // No club photos

    // 3. Verify Sikh Reel Scenes use authentic non-western assets and distinct images
    const sikhScenes = getVideoReelScenes('wedding', 'Sikh Vivah', 'punjabi_sikh');
    expect(sikhScenes).toHaveLength(4);
    expect(sikhScenes[0].audioLabel).toBe('Traditional Shabad Ragas & Dhol (Active)');
    const sikhUrls = new Set(sikhScenes.map((s) => s.imageUrl));
    expect(sikhUrls.size).toBe(4); // 100% unique images across all scenes
    expect(sikhScenes.some((s) => s.imageUrl.includes('photo-1508700115892-45ecd05ae2ad'))).toBe(false); // No concert photos
    expect(sikhScenes.some((s) => s.imageUrl.includes('photo-1516450360452-9312f5e86fc7'))).toBe(false); // No club photos

    // 4. Verify South Indian Reel Scenes
    const southIndianScenes = getVideoReelScenes('wedding', 'Kalyanam', 'south_indian');
    expect(southIndianScenes[0].audioLabel).toBe('Nadaswaram & Thavil Temple Melodies (Active)');
    const southIndianUrls = new Set(southIndianScenes.map((s) => s.imageUrl));
    expect(southIndianUrls.size).toBe(4);

    // 5. Verify Muslim Reel Scenes
    const muslimScenes = getVideoReelScenes('wedding', 'Royal Nikah', 'muslim_nikah');
    expect(muslimScenes[0].audioLabel).toBe('Sufi Santoor & Instrumental Harmony (Active)');
    const muslimUrls = new Set(muslimScenes.map((s) => s.imageUrl));
    expect(muslimUrls.size).toBe(4);

    // 6. Verify SCENE_PRESETS constant is defined and matches
    expect(SCENE_PRESETS.north_indian).toHaveLength(6);
    expect(SCENE_PRESETS.punjabi_sikh).toHaveLength(4);
    expect(SCENE_PRESETS.muslim_nikah).toHaveLength(4);

    // 7. Verify 5-Ceremony dynamic deduplication: Scene 2 and Scene 5 never share the same image
    const dynamicCeremonies = [
      { id: 'c1', name: 'Haldi Blessings' },
      { id: 'c2', name: 'Mehendi Soiree' },
      { id: 'c3', name: 'Sangeet Dhol' },
      { id: 'c4', name: 'Vedic Pheras' },
      { id: 'c5', name: 'Grand Reception' },
    ];
    const dynamicScenes = getVideoReelScenes('wedding', 'Palace Wedding', 'north_indian', dynamicCeremonies);
    expect(dynamicScenes[1].imageUrl).not.toBe(dynamicScenes[4].imageUrl); // Scene 2 != Scene 5
    const dynamicUrls = new Set(dynamicScenes.map((s) => s.imageUrl));
    expect(dynamicUrls.size).toBe(5); // All 5 scenes have unique visual assets
  });

  it('verifies Gemini Concept Studio renders culture-tailored palettes and signature ritual ideas for all traditions', () => {
    // 1. Hindu / Vedic Concept
    const hinduConcept = buildConceptIdea({ eventType: 'wedding', culture: 'north_indian', theme: 'Royal Veda' });
    const hinduHexes = hinduConcept.decorConcept.colorPalette.map((c) => c.hex);
    expect(hinduHexes).toContain('#FF9933'); // Kesariya Gold
    expect(hinduHexes).toContain('#E30B5C'); // Sindoor Red
    expect(hinduHexes).toContain('#FF007F'); // Rani Pink
    expect(hinduConcept.engagementIdeas.some((e) => e.title.includes('Sanskrit Shlokas'))).toBe(true);

    // 2. Muslim / Nikah Concept
    const muslimConcept = buildConceptIdea({ eventType: 'wedding', culture: 'muslim_nikah', theme: 'Mughal Noor' });
    const muslimHexes = muslimConcept.decorConcept.colorPalette.map((c) => c.hex);
    expect(muslimHexes).toContain('#046307'); // Royal Emerald
    expect(muslimHexes).toContain('#FFFFF0'); // Pearl Ivory
    expect(muslimHexes).toContain('#AA3855'); // Rose Quartz
    expect(muslimConcept.engagementIdeas.some((e) => e.title.includes('Attar-Tasting Bar'))).toBe(true);
    expect(muslimConcept.engagementIdeas.some((e) => e.title.includes('Nikahnama'))).toBe(true);

    // 3. Sikh / Anand Karaj Concept
    const sikhConcept = buildConceptIdea({ eventType: 'wedding', culture: 'punjabi_sikh', theme: 'Basanti Kirtan' });
    const sikhHexes = sikhConcept.decorConcept.colorPalette.map((c) => c.hex);
    expect(sikhHexes).toContain('#F4C430'); // Basanti Yellow
    expect(sikhHexes).toContain('#002147'); // Royal Navy
    expect(sikhHexes).toContain('#C45508'); // Rust Orange
    expect(sikhConcept.engagementIdeas.some((e) => e.title.includes('Morning Langar Seva'))).toBe(true);
    expect(sikhConcept.engagementIdeas.some((e) => e.title.includes('Kada'))).toBe(true);

    // 4. South Indian Concept
    const southIndianConcept = buildConceptIdea({ eventType: 'wedding', culture: 'south_indian', theme: 'Temple Muhurtham' });
    const southIndianHexes = southIndianConcept.decorConcept.colorPalette.map((c) => c.hex);
    expect(southIndianHexes).toContain('#CC4E33'); // Temple Terracotta
    expect(southIndianHexes).toContain('#2E6F40'); // Mango Leaf Green
    expect(southIndianHexes).toContain('#F2B705'); // Turmeric Sandal
    expect(southIndianConcept.engagementIdeas.some((e) => e.title.includes('Banana Leaf Feast (Elai Sappadu)'))).toBe(true);
    expect(southIndianConcept.engagementIdeas.some((e) => e.title.includes('Jasmine'))).toBe(true);
  });

  it('verifies Video Reel Modal includes interactive audio synthesizer controls with volume slider, mute/unmute, and scene navigation', () => {
    const handleClose = vi.fn();
    render(
      <EventVideoReelModal
        isOpen={true}
        onClose={handleClose}
        domain="wedding"
        eventTitle="Royal Heritage Vivah"
        culture="north_indian"
      />
    );

    // Verify modal is rendered
    expect(screen.getByRole('dialog', { name: /Event Video Reel|Cinematic Run-of-Show/i })).toBeInTheDocument();

    // Verify audio soundscape badge has authentic label with (Active)
    expect(screen.getByText(/Traditional Shehnai & Dholak Beats \(Active\)/i)).toBeInTheDocument();

    // Verify volume slider control exists and has accessibility label
    const volumeSlider = screen.getByLabelText(/Audio Volume Slider/i);
    expect(volumeSlider).toBeInTheDocument();
    expect(volumeSlider).toHaveAttribute('type', 'range');
    expect(volumeSlider).toHaveValue('0.8');

    // Change volume
    fireEvent.change(volumeSlider, { target: { value: '0.4' } });
    expect(volumeSlider).toHaveValue('0.4');

    // Verify Mute / Unmute button
    const muteButton = screen.getByRole('button', { name: /Mute ambient music|Mute audio/i });
    expect(muteButton).toBeInTheDocument();
    fireEvent.click(muteButton);
    expect(screen.getByRole('button', { name: /Unmute ambient music|Unmute audio/i })).toBeInTheDocument();

    // Verify Scene Jump buttons (previous/next and chapter pills)
    const nextBtn = screen.getByRole('button', { name: /Next scene/i });
    const prevBtn = screen.getByRole('button', { name: /Previous scene/i });
    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeInTheDocument();

    // Verify chapter buttons
    const sceneButtons = screen.getAllByRole('button', { name: /Scene \d+/i });
    expect(sceneButtons.length).toBeGreaterThanOrEqual(3);
    expect(sceneButtons.length).toBeLessThanOrEqual(6);
  });

  it('enforces dynamic scene resolution bounds (minimum 3, maximum 6 scenes)', () => {
    // Single ceremony input -> padded to 3
    const singleCeremony = [{ id: 'c1', name: 'Solemn Vows' }];
    const minScenes = getVideoReelScenes('wedding', 'Quick Wedding', 'north_indian', singleCeremony);
    expect(minScenes.length).toBe(3);

    // 8 ceremonies input -> capped to 6
    const eightCeremonies = [
      { id: 'c1', name: 'Ganesh Puja' },
      { id: 'c2', name: 'Haldi' },
      { id: 'c3', name: 'Mehendi' },
      { id: 'c4', name: 'Sangeet' },
      { id: 'c5', name: 'Baraat' },
      { id: 'c6', name: 'Vedic Pheras' },
      { id: 'c7', name: 'Vidai' },
      { id: 'c8', name: 'Reception' },
    ];
    const maxScenes = getVideoReelScenes('wedding', 'Grand Wedding', 'north_indian', eightCeremonies);
    expect(maxScenes.length).toBe(6);
  });

  it('renders authentic Cultural Ritual Protocols for Hindu, Sikh, Muslim, and South Indian archetypes with interactive checklists', () => {
    const mockAddBudget = vi.fn();
    const mockAddTimeline = vi.fn();

    // 1. Hindu (North Indian / Vedic)
    const { rerender } = render(
      <CulturalRitualProtocols
        culture="north_indian"
        onAddBudgetItem={mockAddBudget}
        onAddTimelineEntry={mockAddTimeline}
      />
    );
    expect(screen.getByText(/Vedic Wedding Operational & Mandap Ritual Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Havan Kund & Mango Wood/i)).toBeInTheDocument();
    expect(screen.getByText(/Pure Desi Cow Ghee/i)).toBeInTheDocument();
    expect(screen.getByText(/Pandit Ji Dakshina, Dhoti & Shawl/i)).toBeInTheDocument();
    expect(screen.getByText(/Groom Royal Safa with Vintage Kalgi/i)).toBeInTheDocument();
    expect(screen.getByText(/Phoolon ki Chaadar Bamboo Trellis/i)).toBeInTheDocument();

    // Test toggle checklist item
    const safaCheckbox = screen.getByRole('checkbox', { name: /Toggle completion for Groom Royal Safa with Vintage Kalgi/i });
    expect(safaCheckbox).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(safaCheckbox);
    expect(safaCheckbox).toHaveAttribute('aria-checked', 'true');

    // Test Add to Budget button
    const addBudgetBtn = screen.getAllByRole('button', { name: /\+ Budget/i })[0];
    fireEvent.click(addBudgetBtn);
    expect(mockAddBudget).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(String),
        estimatedCost: expect.any(Number),
      })
    );

    // 2. Sikh (Anand Karaj)
    rerender(
      <CulturalRitualProtocols
        culture="punjabi_sikh"
        onAddBudgetItem={mockAddBudget}
        onAddTimelineEntry={mockAddTimeline}
      />
    );
    expect(screen.getByText(/Anand Karaj Gurdwara Protocol & Langar Sewa Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Ceremonial Head Coverings/i)).toBeInTheDocument();
    expect(screen.getByText(/Ragi Jatha Honorarium/i)).toBeInTheDocument();
    expect(screen.getByText(/Milni Garlands & Shagan Dry Fruit Trays/i)).toBeInTheDocument();
    expect(screen.getByText(/Communal Langar Sewa Coordination/i)).toBeInTheDocument();

    // 3. Muslim (Nikah & Walima)
    rerender(
      <CulturalRitualProtocols
        culture="muslim_nikah"
        onAddBudgetItem={mockAddBudget}
        onAddTimelineEntry={mockAddTimeline}
      />
    );
    expect(screen.getByText(/Nikah Documentation, Qazi Protocol & Walima Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Handcrafted Silk Nikahnama & Calligraphy Desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Qazi Protocol & Khutbah-e-Nikah/i)).toBeInTheDocument();
    expect(screen.getByText(/Groom Sehra Bandi & Attar Station/i)).toBeInTheDocument();
    expect(screen.getByText(/Arsi Mushaf Antique Mirror Ritual/i)).toBeInTheDocument();

    // 4. South Indian (Kalyanam / Muhurtham)
    rerender(
      <CulturalRitualProtocols
        culture="south_indian"
        onAddBudgetItem={mockAddBudget}
        onAddTimelineEntry={mockAddTimeline}
      />
    );
    expect(screen.getByText(/Muhurtham Temple Mandap & 24-Dish Sadya Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Traditional 24-Dish Banana Leaf Feast \(Elai Sappadu\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kashi Yatra Decorated Silk Umbrella/i)).toBeInTheDocument();
    expect(screen.getByText(/Carved Teakwood Oonjal/i)).toBeInTheDocument();
    expect(screen.getByText(/Madurai Malligai \(Jasmine\) Veni/i)).toBeInTheDocument();
  });
});


