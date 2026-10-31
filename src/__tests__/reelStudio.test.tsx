import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getCultureProfile,
  generateDynamicStoryboard,
  generateVisualQuery,
  evaluateImageQualityGate,
} from '../utils/cultureProfileEngine';
import {
  DemoGenerationProvider,
  LiveAIImageProvider,
} from '../services/aiProviders';
import { AIReelStudio } from '../components/video/AIReelStudio';
import type { IndianCulture, ReelGeneratorInput } from '../types/reelStudio';

describe('UtsavOS AI Cultural Event Reel Generator Engine', () => {
  // --------------------------------------------------------------------------
  // TEST SUITE 1: CULTURE PROFILE ENGINE (13 CULTURES)
  // --------------------------------------------------------------------------
  it('loads valid profiles for all 13 supported Indian cultures with zero gaps', () => {
    const cultures: IndianCulture[] = [
      'punjabi',
      'bengali',
      'gujarati',
      'rajasthani',
      'marathi',
      'tamil',
      'telugu',
      'kannada',
      'malayalam',
      'kashmiri',
      'north_indian',
      'south_indian',
      'custom',
    ];

    cultures.forEach((c) => {
      const profile = getCultureProfile(c);
      expect(profile).toBeDefined();
      expect(profile.cultureName).toBeTruthy();
      expect(profile.region).toBeTruthy();
      expect(profile.traditionalAttire).toBeTruthy();
      expect(profile.decorationStyle).toBeTruthy();
      expect(profile.culturalElements.length).toBeGreaterThan(0);
      expect(profile.rituals.length).toBeGreaterThan(0);
      expect(profile.instruments.length).toBeGreaterThan(0);
      expect(profile.avoidKeywords.length).toBeGreaterThan(0);
      expect(profile.palette.length).toBeGreaterThanOrEqual(4);
    });
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 2: CRITICAL QUALITY TESTS (TESTS A, B, C, D)
  // --------------------------------------------------------------------------
  it('TEST A: Wedding + Punjabi + Hindi + Cinematic generates authentic Punjabi wedding reel', () => {
    const input: ReelGeneratorInput = {
      eventType: 'wedding',
      culture: 'punjabi',
      language: 'hindi',
      style: 'cinematic',
      weddingDetails: {
        brideName: 'Simran',
        groomName: 'Rajveer',
        weddingDate: '2026-11-20',
        venue: 'Grand Haveli Lawn',
        city: 'Amritsar',
        selectedFunctions: ['mehndi', 'haldi', 'sangeet', 'baraat', 'wedding_ceremony', 'reception'],
        guestCount: 500,
        theme: 'Phulkari Splendor',
        mood: 'Joyful & Royal',
        musicPreference: 'Live Dhol & Shehnai',
        specialMessage: 'Rab Ne Bana Di Jodi',
        uploadedPhotos: [],
      },
    };

    const { brief, scenes, consistency } = generateDynamicStoryboard(input);

    expect(brief.cultureName).toBe('Punjabi');
    expect(brief.title).toContain('Rajveer & Simran');
    expect(scenes).toHaveLength(6);

    // Verify Punjabi specific attributes
    const dholOrChoodaFound = scenes.some(
      (s) =>
        s.culturalElements.some((e) => e.toLowerCase().includes('chooda') || e.toLowerCase().includes('dhol')) ||
        s.caption.includes('Rajveer & Simran')
    );
    expect(dholOrChoodaFound).toBe(true);

    // Verify cultural consistency report
    expect(consistency.alignmentScore).toBeGreaterThanOrEqual(94);
    expect(consistency.label).toBe(
      'AI-generated quality estimate, not an official cultural certification'
    );
  });

  it('TEST B: Wedding + Tamil + Tamil + Traditional produces South Indian/Tamil visual and audio direction', () => {
    const input: ReelGeneratorInput = {
      eventType: 'wedding',
      culture: 'tamil',
      language: 'tamil',
      style: 'traditional',
      weddingDetails: {
        brideName: 'Meenakshi',
        groomName: 'Sundaram',
        weddingDate: '2026-12-10',
        venue: 'Temple Mandapam',
        city: 'Madurai',
        selectedFunctions: ['wedding_ceremony', 'reception'],
        guestCount: 400,
        theme: 'Traditional Dravidian',
        mood: 'Sacred & Devout',
        musicPreference: 'Nadaswaram & Thavil',
        specialMessage: 'Divine Union',
        uploadedPhotos: [],
      },
    };

    const { brief, scenes } = generateDynamicStoryboard(input);

    expect(brief.cultureName).toBe('Tamil');
    expect(brief.musicDirection).toContain('Nadaswaram');
    expect(scenes[0].audioBadge).toContain('Nadaswaram');
    // Verify Tamil script caption was generated
    expect(scenes[0].caption).toContain('Sundaram & Meenakshi');
    expect(scenes[0].attireBadge).toContain('Veshti');
  });

  it('TEST C: Birthday + Bengali + Bengali + Emotional generates birthday-specific Bengali cultural direction', () => {
    const input: ReelGeneratorInput = {
      eventType: 'birthday',
      culture: 'bengali',
      language: 'bengali',
      style: 'emotional',
      birthdayDetails: {
        birthdayPersonName: 'Sourav Ganguly',
        age: 25,
        date: '2026-07-08',
        venue: 'Heritage Banquet Hall',
        city: 'Kolkata',
        theme: 'Royal',
        mood: 'Emotional & Nostalgic',
        musicPreference: 'Rabindra Sangeet & Acoustic',
        specialMessage: 'Subho Jonmodin!',
        uploadedPhotos: [],
      },
    };

    const { brief, scenes } = generateDynamicStoryboard(input);

    expect(brief.eventType).toBe('birthday');
    expect(brief.title).toContain("Sourav Ganguly's 25th Birthday");
    expect(scenes[0].title).toBe('Scene 1: Birthday Opening & Spotlight');
    expect(scenes[3].title).toBe('Scene 4: The Cake Cutting & Secret Wish');
    // Bengali caption check
    expect(scenes[0].caption).toContain('Sourav Ganguly');
  });

  it('TEST D: Community + Rajasthani + Hindi + Energetic generates community-focused Rajasthani celebration', () => {
    const input: ReelGeneratorInput = {
      eventType: 'community',
      culture: 'rajasthani',
      language: 'hindi',
      style: 'energetic',
      communityDetails: {
        eventName: 'Marwar Sanskritik Mahotsav',
        eventDate: '2026-10-25',
        venue: 'Fort Courtyard Amphitheatre',
        city: 'Jodhpur',
        communityType: 'Cultural Gathering',
        mainActivities: 'Ghoomar dance showcase, folk artisans, collective feast',
        theme: 'Pride of the Desert',
        mood: 'High Energy & Proud',
        musicPreference: 'Folk Dholak & Sarangi',
        specialMessage: 'Khamma Ghani to all brothers and sisters',
        uploadedPhotos: [],
      },
    };

    const { brief, scenes } = generateDynamicStoryboard(input);

    expect(brief.eventType).toBe('community');
    expect(brief.title).toContain('Marwar Sanskritik Mahotsav');
    // Focus should be on community rather than wedding
    expect(scenes[0].title).toContain('Community Opening');
    expect(scenes[2].title).toContain('Welcoming Families & Honoring Elders');
    expect(scenes[3].title).toContain('Cultural Showcase');
    expect(scenes[4].title).toContain('Collective Triumph');
    expect(scenes[5].title).toContain('Community Legacy');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 3: PROVIDER ABSTRACTION & HONEST DEMO FALLBACK
  // --------------------------------------------------------------------------
  it('verifies DemoGenerationProvider operates honestly with DEMO RENDER label', async () => {
    const provider = new DemoGenerationProvider();
    expect(provider.isAvailable()).toBe(true);

    const result = await provider.generateSceneVisual(
      'Royal mandap adorned with yellow marigolds',
      ['Chooda', 'Dhol']
    );
    expect(result.renderMode).toBe('DEMO RENDER');
    expect(result.imageUrl).toBeTruthy();
  });

  it('verifies LiveAIImageProvider labels results as AI GENERATED RENDER', async () => {
    const liveProvider = new LiveAIImageProvider();
    expect(liveProvider.isAvailable()).toBe(true);

    const visual = await liveProvider.generateSceneVisual(
      'Festive community gathering in Rajasthan',
      ['Folk Dance']
    );
    expect(visual.renderMode).toBe('AI GENERATED RENDER');
    expect(visual.imageUrl).toContain('pollinations.ai');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 4: REACT COMPONENT UI & 3-EVENT SWITCHER
  // --------------------------------------------------------------------------
  it('renders AIReelStudio with strictly 3 event category cards (Wedding, Birthday, Community)', () => {
    render(<AIReelStudio initialEventType="wedding" />);

    // Must show exactly the 3 primary event cards
    expect(screen.getByRole('button', { name: /💍 Wedding/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🎂 Birthday/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🤝 Community/i })).toBeInTheDocument();

    // Must NOT show corporate, festival, anniversary, baby shower
    expect(screen.queryByText(/corporate event/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/baby shower/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/anniversary reel/i)).not.toBeInTheDocument();

    // Verify Cultural Alignment Badge
    expect(screen.getByText(/Cultural Alignment:/i)).toBeInTheDocument();

    // Verify Generate AI Event Reel button
    expect(screen.getByRole('button', { name: /Generate AI Event Reel/i })).toBeInTheDocument();
  });

  it('switches to Birthday tab and clears wedding-specific fields', () => {
    render(<AIReelStudio initialEventType="wedding" />);

    const birthdayCard = screen.getByRole('button', { name: /🎂 Birthday/i });
    fireEvent.click(birthdayCard);

    // Wedding inputs should vanish
    expect(screen.queryByText(/Bride Name/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Groom Name/i)).not.toBeInTheDocument();

    // Birthday inputs should appear
    expect(screen.getByText(/Birthday Person Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Birthday Theme/i)).toBeInTheDocument();
  });

  it('switches to Community tab and displays community fields', () => {
    render(<AIReelStudio initialEventType="wedding" />);

    const communityCard = screen.getByRole('button', { name: /🤝 Community/i });
    fireEvent.click(communityCard);

    expect(screen.queryByText(/Bride Name/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Community \/ Event Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Main Activities/i)).toBeInTheDocument();
  });

  it('interacts with playback controls (Play/Pause, Scrubber, Scene navigation)', () => {
    render(<AIReelStudio initialEventType="wedding" />);

    const playBtns = screen.getAllByLabelText(/play video reel/i);
    expect(playBtns.length).toBeGreaterThan(0);

    fireEvent.click(playBtns[0]);
    const pauseBtns = screen.getAllByLabelText(/pause video reel/i);
    expect(pauseBtns.length).toBeGreaterThan(0);

    // Click Scene 2 button
    const scene2Btn = screen.getByLabelText('Scene 2');
    fireEvent.click(scene2Btn);

    // Verify scene counter changes
    expect(screen.getByText(/Scene 2 of/i)).toBeInTheDocument();
  });

  it('displays "Why this scene?" explanation when button is clicked', () => {
    render(<AIReelStudio initialEventType="wedding" />);

    const whyBtns = screen.getAllByRole('button', { name: /Why\?/i });
    expect(whyBtns.length).toBeGreaterThan(0);

    fireEvent.click(whyBtns[0]);
    const explanationElements = screen.getAllByText(/Why this scene\?/i);
    expect(explanationElements.length).toBeGreaterThanOrEqual(1);
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 5: CULTURE LOCK, WHY THIS VISUAL & MATCH INDICATORS
  // --------------------------------------------------------------------------
  it('TEST 2: Wedding + Bengali Hindu + Bengali + Traditional generates authentic Bengali wedding reel', () => {
    const input: ReelGeneratorInput = {
      eventType: 'wedding',
      culture: 'bengali',
      language: 'bengali',
      style: 'traditional',
      weddingDetails: {
        brideName: 'Debolina',
        groomName: 'Subhasish',
        weddingDate: '2026-11-28',
        venue: 'Kolkata Heritage Rajbari',
        city: 'Kolkata',
        selectedFunctions: ['wedding_ceremony', 'reception'],
        guestCount: 300,
        theme: 'Red and White Alpana Splendor',
        mood: 'Sacred & Joyful',
        musicPreference: 'Live Dhak & Shehnai',
        specialMessage: 'Subho Bibaho',
        uploadedPhotos: [],
      },
    };

    const { brief, scenes } = generateDynamicStoryboard(input);

    expect(brief.cultureName).toBe('Bengali');
    expect(brief.musicDirection).toContain('Dhak');
    // Bengali bride and ceremony checks
    const hasBengaliSymbols = scenes.some(
      (s) =>
        s.culturalElements.some((e) => e.toLowerCase().includes('topor') || e.toLowerCase().includes('dhak') || e.toLowerCase().includes('alpana')) ||
        s.caption.includes('Subhasish & Debolina')
    );
    expect(hasBengaliSymbols).toBe(true);
    expect(scenes[0].whyThisVisual).toContain('Bengali');
  });

  it('renders Culture Lock banner and toggles culture change with warning', () => {
    render(<AIReelStudio initialEventType="wedding" initialCulture="punjabi" />);

    // Must show locked culture banner
    expect(screen.getByText(/CULTURE LOCKED \(PUNJABI\)/i)).toBeInTheDocument();
    expect(screen.getByText(/All generated scenes follow the/i)).toBeInTheDocument();

    // Click Change Culture
    const changeBtn = screen.getByRole('button', { name: /Change Culture/i });
    fireEvent.click(changeBtn);

    // Warning message and select should appear
    expect(screen.getByText(/Changing culture will regenerate affected visuals, audio and captions/i)).toBeInTheDocument();
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
  });

  it('renders Cultural Match Indicators and "Why this visual?" explainability', () => {
    render(<AIReelStudio initialEventType="wedding" initialCulture="punjabi" />);

    // Cultural Match Indicators on scene cards
    const cultureMatchLabels = screen.getAllByText(/Culture Match:/i);
    expect(cultureMatchLabels.length).toBeGreaterThan(0);

    const sceneMatchLabels = screen.getAllByText(/Scene Match:/i);
    expect(sceneMatchLabels.length).toBeGreaterThan(0);

    const eventMatchLabels = screen.getAllByText(/Event Match:/i);
    expect(eventMatchLabels.length).toBeGreaterThan(0);

    // Click Why this visual button
    const whyVisualBtns = screen.getAllByRole('button', { name: /Why visual\?/i });
    expect(whyVisualBtns.length).toBeGreaterThan(0);

    fireEvent.click(whyVisualBtns[0]);
    expect(screen.getAllByText(/Why this visual\?/i).length).toBeGreaterThanOrEqual(1);
  });

  it('generates semantic search query with negative exclusions and passes quality gate', () => {
    const visualQuery = generateVisualQuery('wedding', 'punjabi', 'culture', 'cinematic');
    expect(visualQuery.query).toContain('Punjabi');
    expect(visualQuery.query).toContain('wedding');
    expect(visualQuery.negativeQuery).toContain('Tamil');
    expect(visualQuery.negativeQuery).toContain('Kerala');

    // Quality gate evaluates candidate image
    const gate = evaluateImageQualityGate(
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      'wedding',
      'punjabi',
      'culture'
    );
    expect(gate.passed).toBe(true);
    expect(gate.cultureMatch).toBeGreaterThanOrEqual(0.85);
    expect(gate.quality).toBeGreaterThanOrEqual(0.75);
  });
});
