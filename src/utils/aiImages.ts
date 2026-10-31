import { sanitizeInput, sanitizeUrl } from './sanitizer';
import type { EventDomain } from '../types/event';
import type { VideoScene, ReelScene, TraditionType } from '../types/ai';
import type { WeddingCulture } from '../types/wedding';

export interface ConceptImagePrompts {
  decorPrompt: string;
  lightingPrompt: string;
  experiencePrompt: string;
}

// Curated high-definition, rate-limit-free image collections
export const FALLBACK_IMAGES = {
  decor: {
    wedding: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    birthday: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1000&q=80',
    community: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1000&q=80',
  },
  lighting: {
    wedding: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
    birthday: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
    community: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1000&q=80',
  },
  experience: {
    wedding: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
    community: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
  },
  heroBanners: {
    wedding: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    birthday: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=85',
    community: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=85',
  },
};

// Rich image pools for multi-concept variety without rate limits
export const EVENT_IMAGE_POOLS = {
  wedding: {
    decor: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80', // Royal mandap & holy agni kunda
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', // Yellow marigold drapes & brass urli
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', // Royal banquet & floral tablescape
    ],
    lighting: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80', // Warm fairy light floral canopy & chandeliers
      'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80', // Decorated amphitheatre & fairy lights
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80', // Candlelit sacred aisle
    ],
    experience: [
      'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80', // Traditional folk dance & dhol beats
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', // Henna palms & turmeric ritual
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80', // Sacred Varmala & 7 Pheras ceremony
    ],
  },
  birthday: {
    decor: [
      'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1200&q=80', // Milestone balloons
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', // Birthday confections
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=1200&q=80', // Party tablescape
    ],
    lighting: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80', // Neon lounge & lasers
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', // Vibrant party glow
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', // Club beams
    ],
    experience: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80', // 360 photo booth
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', // Arcade & live DJ
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', // Dance arena
    ],
  },
  community: {
    decor: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80', // Festival banners
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80', // Open-air banquet
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', // Communal stalls
    ],
    lighting: [
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80', // Bistro festoon lights
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80', // Lantern glow
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80', // Twilight pavilion
    ],
    experience: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', // Mosaic mural & buskers
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80', // Food artisan exchange
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80', // Acoustic stage
    ],
  },
};

/**
 * Returns a guaranteed, rate-limit-free, curated high-definition image
 */
export function getReliableEventImage(
  domain: EventDomain,
  conceptType: 'decor' | 'lighting' | 'experience',
  index = 0
): string {
  const pool = EVENT_IMAGE_POOLS[domain]?.[conceptType];
  if (!pool || pool.length === 0) {
    return FALLBACK_IMAGES[conceptType][domain] || FALLBACK_IMAGES.decor.wedding;
  }
  const safeIndex = Math.abs(index) % pool.length;
  return sanitizeUrl(pool[safeIndex]);
}

/**
 * Builds a secure, sanitized AI image URL with reliable fallback
 */
export function buildAIImageUrl(promptText: string, width = 800, height = 450): string {
  const sanitizedPrompt = sanitizeInput(promptText).trim();
  if (!sanitizedPrompt) {
    return FALLBACK_IMAGES.decor.wedding;
  }

  // Construct standard Pollinations endpoint with nologo flag
  const encoded = encodeURIComponent(sanitizedPrompt);
  const rawUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true`;
  return sanitizeUrl(rawUrl);
}

/**
 * Builds tailored prompt descriptions for all 3 concept dimensions
 */
export function generateConceptPrompts(
  domain: EventDomain,
  theme: string,
  environment: string
): ConceptImagePrompts {
  const baseTheme = sanitizeInput(theme || 'Luxury Celebration');
  const env = sanitizeInput(environment || 'Ballroom');

  if (domain === 'wedding') {
    return {
      decorPrompt: `cinematic 8k photo of luxury wedding tablescape, ${baseTheme}, opulent floral centerpiece with roses and hydrangeas, crystal candelabras, gold tableware, candlelight glow, ${env}, architectural digest photography`,
      lightingPrompt: `dreamy wedding lighting scheme, starry fairy light ceiling canopy, warm amber pin-spot illumination, mandap altar stage glow, fog blanket on dance floor, ${env}, 8k photorealistic`,
      experiencePrompt: `interactive wedding guest experience, vintage rotary telephone audio guestbook on ornate table, artisanal champagne mixology bar with smoking botanical cocktails, elegant guest crowd, 8k luxury event photography`,
    };
  }

  if (domain === 'birthday') {
    return {
      decorPrompt: `modern milestone birthday celebration party decor, ${baseTheme}, sleek metallic balloon installation, illuminated LED number sculpture, tiered gourmet cake table, velvet lounge seating, 8k luxury party`,
      lightingPrompt: `electric violet and cyan ambient birthday lighting, laser glow beams, neon typographic sign, backlit cocktail bar, starry party atmosphere, 8k vivid cinematography`,
      experiencePrompt: `interactive birthday experience, retro arcade claw machine with personalized favors, live nitrogen ice cream bar, 360 video photo booth with confetti, 8k photorealistic`,
    };
  }

  return {
    decorPrompt: `vibrant outdoor community celebration festival, ${baseTheme}, artisanal market stalls with festive floral garlands, wooden banquet tables, fairy lantern canopy, ${env}, high resolution documentary photography`,
    lightingPrompt: `community fair twilight lighting, warm festoon bistro string lights across open pavilion, decorative lantern trees, glowing stage truss, safety floodlights, 8k atmospheric photography`,
    experiencePrompt: `interactive community workshop pavilion, live mural collaborative painting wall, acoustic folk band busking stage, family activities, 8k sunny outdoor festival photography`,
  };
}

/**
 * Gets the panoramic hero banner image for a domain
 */
export function getHeroBannerImage(domain: EventDomain): string {
  return FALLBACK_IMAGES.heroBanners[domain] || FALLBACK_IMAGES.heroBanners.wedding;
}

/**
 * Curated contextual image pools for tag & keyword-based visual matching
 */
export const CONTEXTUAL_SCENE_IMAGE_POOLS = {
  // Yellow decor, marigold floral imagery, turmeric paste & brass urli
  haldi: [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1400&q=85',
  ],
  // Traditional Indian Sangeet & folk dance (NO CONCERT / CLUB / WESTERN PHOTOS)
  sangeet: [
    'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1400&q=85', // Decorated amphitheatre, colorful drapes & traditional folk dance
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=85', // Warm fairy lights & floral chandelier canopy
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=85', // Festive celebration crowd & live dhol
  ],
  // Altar, royal mandap fire, sacred couple ceremony visuals (NO WESTERN SUITS)
  pheras_mandap: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85', // Royal red/gold mandap, holy agni kunda, crimson lehenga & sherwani, varmala
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85', // Palace floral mandap archway & sacred altar
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85', // Candlelit sacred aisle
  ],
  // Grand chandelier ballroom, formal royal banquet, toast
  reception: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85', // Regal heritage palace banquet, crystal vintage chandeliers, candlelit floral dining
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85', // Royal banquet & champagne setup
    'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1400&q=85', // Grand ballroom celebration
  ],
  // Festive balloons, birthday sparkler cake
  cake_birthday: [
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1400&q=85',
  ],
  // Open-air lawn, crowds, stage pavilion
  community_fair: [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=85',
  ],
  // Henna artistry & rituals
  mehendi: [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85', // Authentic henna palms, yellow-green silk drapes, lac bangles & floral canopies
    'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1400&q=85', // Henna night & traditional geet
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85',
  ],
  // Royal procession, arrival & floral garlands
  baraat_procession: [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=85', // Royal Baraat arrival & fanfare
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85',
  ],
  // Traditional Chooda & Kalire blessing
  chooda: [
    'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85',
  ],
  // Emotional Vidaai send-off ceremony
  vidaai: [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
  ],
};

export interface CeremonyItem {
  id?: string;
  name?: string;
  title?: string;
  date?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  attireCode?: string;
  ritualNotes?: string;
  ritualTags?: string[];
  description?: string;
  type?: string;
}

export interface SceneVisualMatch {
  imageUrl: string;
  tag:
    | 'haldi'
    | 'mehendi'
    | 'sangeet'
    | 'pheras_mandap'
    | 'reception'
    | 'cake_birthday'
    | 'community_fair'
    | 'baraat_procession'
    | 'chooda'
    | 'vidaai';
  keywordMatched: string;
  musicMood: 'sacred_ritual' | 'energetic_dance' | 'formal_gala' | 'festive_party' | 'community_outdoor';
}

/**
 * Returns authentic ritual soundscape label tailored to culture and domain
 */
export function getCultureAudioSoundscape(
  culture: WeddingCulture | TraditionType = 'north_indian',
  domain: EventDomain = 'wedding'
): string {
  if (domain === 'birthday') return 'Birthday Fanfare & Pop Synthesizer (Active)';
  if (domain === 'community') return 'Acoustic Folk & Brass Fanfare (Active)';

  switch (culture) {
    case 'punjabi_sikh':
    case 'sikh':
      return 'Traditional Shabad Ragas & Dhol (Active)';
    case 'muslim_nikah':
    case 'muslim':
      return 'Sufi Santoor & Instrumental Harmony (Active)';
    case 'south_indian':
    case 'south_indian_kalyanam':
      return 'Nadaswaram & Thavil Temple Melodies (Active)';
    case 'fusion_cross_cultural':
    case 'fusion':
      return 'East-Meets-West Melodic Fusion (Sitar + Cello + Acoustic DJ) (Active)';
    case 'christian_western':
      return 'Acoustic Symphony & Classical Harmony (Active)';
    case 'north_indian':
    case 'hindu':
    default:
      return 'Traditional Shehnai, Sitar & Sacred Vedic Chants (Active)';
  }
}

/**
 * Smart tag-based visual matcher function.
 * Scans ceremony title, ritual type, and description keywords to resolve contextually matched imagery.
 * Ensures zero duplicate images across scenes when usedUrls set is supplied.
 */
export function resolveSceneVisual(
  ceremony: CeremonyItem | Record<string, unknown>,
  index = 0,
  _culture: WeddingCulture = 'north_indian',
  usedUrls?: Set<string>
): SceneVisualMatch & string {
  const c = ceremony || {};
  const textToScan = [
    c.name,
    c.title,
    c.ritualNotes,
    c.description,
    c.type,
    c.venue,
    c.location,
    c.attireCode,
    ...(Array.isArray(c.ritualTags) ? c.ritualTags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let tag: SceneVisualMatch['tag'] = 'pheras_mandap';
  let keywordMatched = 'sacred';
  let musicMood: SceneVisualMatch['musicMood'] = 'sacred_ritual';

  // 1. Haldi / Turmeric / Ubtan
  if (/\b(haldi|turmeric|pithi|manjha|vatna|mayun|ubtan|sunshine)\b/i.test(textToScan)) {
    tag = 'haldi';
    keywordMatched = 'haldi';
    musicMood = 'sacred_ritual';
  }
  // 2. Chooda / Kalire
  else if (/\b(chooda|chuda|kalire|kalira)\b/i.test(textToScan)) {
    tag = 'chooda';
    keywordMatched = 'chooda';
    musicMood = 'sacred_ritual';
  }
  // 3. Vidaai / Emotional Send-off / Doli
  else if (/\b(vidaai|bidai|farewell|send-off|sendoff|doli|departure|rukshati|rukhsati)\b/i.test(textToScan)) {
    tag = 'vidaai';
    keywordMatched = 'vidaai';
    musicMood = 'sacred_ritual';
  }
  // 4. Sangeet / Dance / Musical / Jaggo / Dhol / Boliyan / Garba
  else if (/\b(sangeet|dance|musical|cocktail|jaggo|party|dj|garba|raas|bhangra|boliyan)\b/i.test(textToScan)) {
    tag = 'sangeet';
    keywordMatched = 'sangeet';
    musicMood = 'energetic_dance';
  }
  // 5. Pheras / Mandap / Sacred / Nikah / Vows / Anand Karaj / Laavan / Muhurtham
  else if (/\b(phera|pheras|mandap|sacred|nikah|vow|vows|anand karaj|laavan|muhurtham|thali|saptapadi|kanyadaan|vratham|altar|ring|solemnization|qubool)\b/i.test(textToScan)) {
    tag = 'pheras_mandap';
    keywordMatched = 'pheras_mandap';
    musicMood = 'sacred_ritual';
  }
  // 6. Reception / Dinner / Gala / Banquet / Walima / Sadya
  else if (/\b(reception|dinner|gala|banquet|walima|sadya|toast|feast|celebration gala|dawat)\b/i.test(textToScan)) {
    tag = 'reception';
    keywordMatched = 'reception';
    musicMood = 'formal_gala';
  }
  // 7. Cake / Birthday / Milestone / Pinata
  else if (/\b(cake|birthday|milestone|pinata|candle|age|celebrant|balloons)\b/i.test(textToScan)) {
    tag = 'cake_birthday';
    keywordMatched = 'cake_birthday';
    musicMood = 'festive_party';
  }
  // 8. Community / Permit / Festival / Fair / Parade / Stage
  else if (/\b(permit|festival|community|parade|fair|market|civic|stage|pavilion|lawn|artisan|volunteer)\b/i.test(textToScan)) {
    tag = 'community_fair';
    keywordMatched = 'community_fair';
    musicMood = 'community_outdoor';
  }
  // 9. Mehendi / Henna
  else if (/\b(mehendi|mehndi|henna)\b/i.test(textToScan)) {
    tag = 'mehendi';
    keywordMatched = 'mehendi';
    musicMood = 'sacred_ritual';
  }
  // 10. Baraat / Procession / Arrival / Kashi Yatra / Oonjal
  else if (/\b(baraat|procession|processional|arrival|kashi yatra|oonjal)\b/i.test(textToScan)) {
    tag = 'baraat_procession';
    keywordMatched = 'baraat_procession';
    musicMood = 'sacred_ritual';
  } else {
    // Default fallback cycle across key celebration stages
    const defaultCycle: SceneVisualMatch['tag'][] = ['pheras_mandap', 'haldi', 'sangeet', 'reception'];
    tag = defaultCycle[Math.abs(index) % defaultCycle.length];
    keywordMatched = tag;
    musicMood = tag === 'sangeet' ? 'energetic_dance' : tag === 'reception' ? 'formal_gala' : 'sacred_ritual';
  }

  const pool = CONTEXTUAL_SCENE_IMAGE_POOLS[tag] || CONTEXTUAL_SCENE_IMAGE_POOLS.pheras_mandap;

  // Guarantee unique image: find first candidate in pool not yet in usedUrls
  let selectedUrl = pool[Math.abs(index) % pool.length];
  if (usedUrls && usedUrls.has(selectedUrl)) {
    const unusedCandidate = pool.find((u) => !usedUrls.has(u));
    if (unusedCandidate) {
      selectedUrl = unusedCandidate;
    } else {
      // If pool exhausted, scan alternate authentic cultural pools for uniqueness
      const fallbackPools = [
        CONTEXTUAL_SCENE_IMAGE_POOLS.pheras_mandap,
        CONTEXTUAL_SCENE_IMAGE_POOLS.reception,
        CONTEXTUAL_SCENE_IMAGE_POOLS.haldi,
        CONTEXTUAL_SCENE_IMAGE_POOLS.baraat_procession,
        CONTEXTUAL_SCENE_IMAGE_POOLS.sangeet,
      ].flat();
      const distinctFallback = fallbackPools.find((u) => !usedUrls.has(u));
      if (distinctFallback) {
        selectedUrl = distinctFallback;
      }
    }
  }

  const imageUrl = sanitizeUrl(selectedUrl);

  return Object.assign(new String(imageUrl), {
    imageUrl,
    tag,
    keywordMatched,
    musicMood,
  }) as unknown as SceneVisualMatch & string;
}

/**
 * Strict culture-authentic scene presets for AI Video Reel.
 * Guaranteed deterministic scenes, culture-authentic subtitles, audio soundscapes, and HD images.
 */
export interface TraditionScene {
  id: string;
  dayBadge: string;
  timeBadge: string;
  venueBadge: string;
  attireBadge: string;
  title: string;
  subtitle: string;
  audioBadge: string;
  imageUrl: string;
  sceneNumber?: number;
  startTimeSeconds?: number;
  durationSeconds?: number;
  zoomDirection?: 'in' | 'out' | 'pan-left' | 'pan-right';
  overlayTag?: string;
  venue?: string;
  time?: string;
  attireCode?: string;
  ritualNotes?: string;
  matchedKeyword?: string;
  musicMood?: 'sacred_ritual' | 'energetic_dance' | 'formal_gala' | 'festive_party' | 'community_outdoor';
  audioLabel?: string;
}

export const CULTURAL_REEL_SCENES: Record<string, TraditionScene[]> = {
  hindu_vedic: [
    {
      id: "h_mehendi",
      dayBadge: "Day 1 (2026-11-18)",
      timeBadge: "03:00 PM",
      venueBadge: "Lawn and Mehndi Stage Set",
      attireBadge: "Vibrant Yellow & Lime Green",
      title: "Scene 1: Day 1: Mehendi & Henna Fiesta",
      subtitle: "UtsavOS Wedding Celebration • Poolside Lawn & Cabanas • Live Rajasthani henna artists applying intricate mehndi patterns, colorful drapes, marigolds, and fresh coconut water stalls.",
      audioBadge: "Traditional Shehnai & Dholak Beats (Active)",
      // Ref image_17.png: Henna palms, floral yellow-green drapes, and ethnic ritual patterns
      imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
      sceneNumber: 1,
      startTimeSeconds: 0,
      durationSeconds: 4,
      zoomDirection: 'in',
      overlayTag: "Day 1 (2026-11-18) • 03:00 PM",
      venue: "Lawn and Mehndi Stage Set",
      time: "03:00 PM",
      attireCode: "Vibrant Yellow & Lime Green",
      audioLabel: "Traditional Shehnai & Dholak Beats (Active)",
      musicMood: "sacred_ritual",
    },
    {
      id: "h_haldi",
      dayBadge: "Day 3 (2026-11-20)",
      timeBadge: "09:00 AM",
      venueBadge: "Lotus Courtyard",
      attireBadge: "Traditional Mustard & White Kurta",
      title: "Scene 2: Day 3: Haldi & Chooda Morning",
      subtitle: "UtsavOS Wedding Celebration • Lotus Courtyard • Traditional Ubtan / Haldi ceremony with a crowd applying fresh turmeric paste on the couple seated in a brass urli, marigold flower decorations, and rose petal showers.",
      audioBadge: "Sanai and Folk Ceremonial Music (Active)",
      // Ref image_18.png: Brass urli, genda phool, ubtan ceremony, and emotional collective application
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
      sceneNumber: 2,
      startTimeSeconds: 4,
      durationSeconds: 4,
      zoomDirection: 'pan-left',
      overlayTag: "Day 3 (2026-11-20) • 09:00 AM",
      venue: "Lotus Courtyard",
      time: "09:00 AM",
      attireCode: "Traditional Mustard & White Kurta",
      audioLabel: "Sanai and Folk Ceremonial Music (Active)",
      musicMood: "sacred_ritual",
    },
    {
      id: "h_chooda",
      dayBadge: "Day 3 (2026-11-20)",
      timeBadge: "10:30 AM",
      venueBadge: "Auspicious Heritage Stage",
      attireBadge: "Festive Red & Ivory Silks",
      title: "Scene 3: Day 3: Chooda Ceremony & Blessing",
      subtitle: "UtsavOS Wedding Celebration • Auspicious Heritage Stage • Traditional Chooda with heavy red, gold, and green bangles, hanging golden ornaments (Kalire) being touch-blessed by the family.",
      audioBadge: "Punjabi Folk & Dholak Chants (Active)",
      // Ref image_19.png: Fine details of heavy wedding chooda, golden hanging kalire and traditional bridal bangles
      imageUrl: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80",
      sceneNumber: 3,
      startTimeSeconds: 8,
      durationSeconds: 4,
      zoomDirection: 'pan-right',
      overlayTag: "Day 3 (2026-11-20) • 10:30 AM",
      venue: "Auspicious Heritage Stage",
      time: "10:30 AM",
      attireCode: "Festive Red & Ivory Silks",
      audioLabel: "Punjabi Folk & Dholak Chants (Active)",
      musicMood: "sacred_ritual",
    },
    {
      id: "h_pheras",
      dayBadge: "Day 3 (2026-11-20)",
      timeBadge: "12:00 PM",
      venueBadge: "Palace Mandap by Lotus Pond",
      attireBadge: "Regal Traditional / Crimson Lehenga & Ivory Sherwani",
      title: "Scene 4: Day 3: Baraat, Varmala & Sacred Pheras",
      subtitle: "UtsavOS Wedding Celebration • Palace Mandap by Lotus Pond • Mandap with floral trails and sacred Agni (sacred fire), with the bride in red lehenga and groom in sherwani and sehra completing the circular pheras (seven vows).",
      audioBadge: "Classical Vedic Chants & Sacred Shehnai (Active)",
      // Ref image_22.png: Royal Mandap, sacred fire, pheras / Mangal Fera around fire with traditional drapery and priest
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      sceneNumber: 4,
      startTimeSeconds: 12,
      durationSeconds: 4,
      zoomDirection: 'in',
      overlayTag: "Day 3 (2026-11-20) • 12:00 PM",
      venue: "Palace Mandap by Lotus Pond",
      time: "12:00 PM",
      attireCode: "Regal Traditional / Crimson Lehenga & Ivory Sherwani",
      audioLabel: "Classical Vedic Chants & Sacred Shehnai (Active)",
      musicMood: "sacred_ritual",
    },
    {
      id: "h_vidaai",
      dayBadge: "Day 3 (2026-11-20)",
      timeBadge: "04:30 PM",
      venueBadge: "Exit Portico",
      attireBadge: "Traditional Wedding Finery",
      title: "Scene 5: Day 3: Emotional Vidaai / Send-off",
      subtitle: "UtsavOS Wedding Celebration • Exit Portico • Emotional Vidaai send-off ceremony, with the bride throwing puffed rice overhead, tearful family farewells, and the couple seated in the decorated bridal vehicle.",
      audioBadge: "Plaintive Shehnai & Emotional Folk Sitar (Active)",
      // Ref image_21.png: Tearful Vidaai, throw of puffed rice, family embrace, and decorated send-off vehicle
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      sceneNumber: 5,
      startTimeSeconds: 16,
      durationSeconds: 4,
      zoomDirection: 'pan-left',
      overlayTag: "Day 3 (2026-11-20) • 04:30 PM",
      venue: "Exit Portico",
      time: "04:30 PM",
      attireCode: "Traditional Wedding Finery",
      audioLabel: "Plaintive Shehnai & Emotional Folk Sitar (Active)",
      musicMood: "sacred_ritual",
    },
    {
      id: "h_reception",
      dayBadge: "Day 4 (2026-11-21)",
      timeBadge: "07:00 PM",
      venueBadge: "Crystal Grand Ballroom",
      attireBadge: "Evening Regal / Sherwani & Lehenga",
      title: "Scene 6: Day 4: Grand Reception Gala & Feast",
      subtitle: "UtsavOS Wedding Celebration • Crystal Grand Ballroom • Royal reception stage with heavy golden lighting, floral backdrops, candlelit tablescape, grand banquet with large gatherings of family and friends celebrating the new couple.",
      audioBadge: "Sitar & Acoustic Sangeet Orchestra (Active)",
      // Ref image_23.png: Grand Palace indoor reception stage with floral backdrops, warm crystal chandeliers, banquet tablescapes, and crowd
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      sceneNumber: 6,
      startTimeSeconds: 20,
      durationSeconds: 4,
      zoomDirection: 'out',
      overlayTag: "Day 4 (2026-11-21) • 07:00 PM",
      venue: "Crystal Grand Ballroom",
      time: "07:00 PM",
      attireCode: "Evening Regal / Sherwani & Lehenga",
      audioLabel: "Sitar & Acoustic Sangeet Orchestra (Active)",
      musicMood: "formal_gala",
    }
  ]
};

export const SCENE_PRESETS: Record<TraditionType, ReelScene[]> = {
  north_indian: CULTURAL_REEL_SCENES.hindu_vedic,
  muslim_nikah: [
    {
      id: 'scene-muslim-1',
      sceneNumber: 1,
      title: 'Scene 1: Manjha & Mehendi',
      subtitle: 'Pastel green decor, floral jewelry, royal attar station & family henna blessings.',
      startTimeSeconds: 0,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 1 • 06:30 PM',
      venue: 'Rose Garden Pavilion',
      time: 'Day 1 • 06:30 PM',
      ritualNotes: 'Pastel green decor, floral jewelry, royal attar station & family henna blessings.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Sufi Santoor & Instrumental Harmony (Active)',
    },
    {
      id: 'scene-muslim-2',
      sceneNumber: 2,
      title: 'Scene 2: Qubool Hai & Nikah Ceremony',
      subtitle: 'Floral jaali, Nikahnama signing, Sehra Bandi & calligraphic Quran stand.',
      startTimeSeconds: 4,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'pan-right',
      overlayTag: 'Day 2 • 11:30 AM',
      venue: 'Palace Darbar Hall',
      time: 'Day 2 • 11:30 AM',
      ritualNotes: 'Floral jaali, Nikahnama signing, Sehra Bandi & calligraphic Quran stand.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Sufi Santoor & Instrumental Harmony (Active)',
    },
    {
      id: 'scene-muslim-3',
      sceneNumber: 3,
      title: 'Scene 3: Arsi Mushaf & Rukhsati',
      subtitle: 'Traditional mirror ceremony, family blessings & emotional Quran canopy send-off.',
      startTimeSeconds: 8,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'pan-left',
      overlayTag: 'Day 3 • 02:30 PM',
      venue: 'Grand Courtyard',
      time: 'Day 3 • 02:30 PM',
      ritualNotes: 'Traditional mirror ceremony, family blessings & emotional Quran canopy send-off.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Sufi Santoor & Instrumental Harmony (Active)',
    },
    {
      id: 'scene-muslim-4',
      sceneNumber: 4,
      title: 'Scene 4: Walima Reception',
      subtitle: 'Mughal court theme, chandeliers, royal banquet & festive celebration.',
      startTimeSeconds: 12,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'out',
      overlayTag: 'Day 4 • 08:00 PM',
      venue: 'Crystal Grand Ballroom',
      time: 'Day 4 • 08:00 PM',
      ritualNotes: 'Mughal court theme, chandeliers, royal banquet & festive celebration.',
      musicMood: 'formal_gala',
      audioLabel: 'Sufi Santoor & Instrumental Harmony (Active)',
    },
  ],
  punjabi_sikh: [
    {
      id: 'scene-sikh-1',
      sceneNumber: 1,
      title: 'Scene 1: Kurmai & Jaggo Night',
      subtitle: 'Traditional brass lamps, giddha dholak, vibrant folk music & midnight celebration.',
      startTimeSeconds: 0,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 1 • 07:30 PM',
      venue: 'Heritage Haveli Lawn',
      time: 'Day 1 • 07:30 PM',
      ritualNotes: 'Traditional brass lamps, giddha dholak, vibrant folk music & midnight celebration.',
      musicMood: 'energetic_dance',
      audioLabel: 'Traditional Shabad Ragas & Dhol (Active)',
    },
    {
      id: 'scene-sikh-2',
      sceneNumber: 2,
      title: 'Scene 2: Vatna & Chooda',
      subtitle: 'Turmeric rituals, Kalire ceremony, maternal shagan & auspicious blessings.',
      startTimeSeconds: 4,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'pan-left',
      overlayTag: 'Day 2 • 09:30 AM',
      venue: 'Lotus Courtyard',
      time: 'Day 2 • 09:30 AM',
      ritualNotes: 'Turmeric rituals, Kalire ceremony, maternal shagan & auspicious blessings.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Traditional Shabad Ragas & Dhol (Active)',
    },
    {
      id: 'scene-sikh-3',
      sceneNumber: 3,
      title: 'Scene 3: Sacred Anand Karaj',
      subtitle: 'Gurdwara Sahib Darbar, 4 Laavan, floral aisle, sacred kirtan & ardas.',
      startTimeSeconds: 8,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 3 • 11:30 AM',
      venue: 'Gurdwara Sahib Darbar',
      time: 'Day 3 • 11:30 AM',
      ritualNotes: 'Gurdwara Sahib Darbar, 4 Laavan, floral aisle, sacred kirtan & ardas.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Traditional Shabad Ragas & Dhol (Active)',
    },
    {
      id: 'scene-sikh-4',
      sceneNumber: 4,
      title: 'Scene 4: Doli & Grand Reception',
      subtitle: 'Family farewell & evening gala, phulkari canopy & celebratory reception dinner.',
      startTimeSeconds: 12,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'out',
      overlayTag: 'Day 4 • 08:00 PM',
      venue: 'Palace Grand Ballroom',
      time: 'Day 4 • 08:00 PM',
      ritualNotes: 'Family farewell & evening gala, phulkari canopy & celebratory reception dinner.',
      musicMood: 'formal_gala',
      audioLabel: 'Traditional Shabad Ragas & Dhol (Active)',
    },
  ],
  south_indian: [
    {
      id: 'scene-si-1',
      sceneNumber: 1,
      title: 'Scene 1: Oonjal & Traditional Kashi Yatra',
      subtitle: 'Decorated wooden swing, tender coconut decor & brass kuthuvilakku lamps.',
      startTimeSeconds: 0,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 1 • 08:30 AM',
      venue: 'Temple Mandap Garden',
      time: 'Day 1 • 08:30 AM',
      ritualNotes: 'Decorated wooden swing, tender coconut decor & brass kuthuvilakku lamps.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Nadaswaram & Thavil Temple Melodies (Active)',
    },
    {
      id: 'scene-si-2',
      sceneNumber: 2,
      title: 'Scene 2: Auspicious Muhurtham & Thali Kettu',
      subtitle: 'Temple mandap with banana trees, jasmine veni & yellow Kanjeevaram silk.',
      startTimeSeconds: 4,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'pan-right',
      overlayTag: 'Day 2 • 09:15 AM',
      venue: 'Auspicious Temple Sanctum',
      time: 'Day 2 • 09:15 AM',
      ritualNotes: 'Temple mandap with banana trees, jasmine veni & yellow Kanjeevaram silk.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Nadaswaram & Thavil Temple Melodies (Active)',
    },
    {
      id: 'scene-si-3',
      sceneNumber: 3,
      title: 'Scene 3: Saptapadi & 24-Dish Banana Leaf Sadya',
      subtitle: 'Traditional banana leaf feast (Elai Sappadu) curation with authentic jasmine fragrance canopy.',
      startTimeSeconds: 8,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 3 • 12:30 PM',
      venue: 'Sadya Dining Pavilion',
      time: 'Day 3 • 12:30 PM',
      ritualNotes: 'Traditional banana leaf feast (Elai Sappadu) curation with authentic jasmine fragrance canopy.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Nadaswaram & Thavil Temple Melodies (Active)',
    },
    {
      id: 'scene-si-4',
      sceneNumber: 4,
      title: 'Scene 4: Mangala Deepam & Reception Gala',
      subtitle: 'Ceremonial Brass Deepam Lighting • Classical Carnatic & Nadaswaram melodies.',
      startTimeSeconds: 12,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'out',
      overlayTag: 'Day 4 • 07:30 PM',
      venue: 'Grand Convention Hall',
      time: 'Day 4 • 07:30 PM',
      ritualNotes: 'Ceremonial Brass Deepam Lighting • Classical Carnatic & Nadaswaram melodies.',
      musicMood: 'formal_gala',
      audioLabel: 'Nadaswaram & Thavil Temple Melodies (Active)',
    },
  ],
  fusion_cross_cultural: [
    {
      id: 'scene-fc-1',
      sceneNumber: 1,
      title: 'Scene 1: Welcome Sangeet & Global Cocktail Mixer',
      subtitle: 'Henna artists, global tapas, family flashmob & fusion beats.',
      startTimeSeconds: 0,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 1 • 06:30 PM',
      venue: 'Heritage Courtyard',
      time: 'Day 1 • 06:30 PM',
      ritualNotes: 'Henna artists, global tapas, family flashmob & fusion beats.',
      musicMood: 'energetic_dance',
      audioLabel: 'East-Meets-West Melodic Fusion (Sitar + Cello + Acoustic DJ) (Active)',
    },
    {
      id: 'scene-fc-2',
      sceneNumber: 2,
      title: 'Scene 2: Vedic Sacred Pheras & Mandap Havan',
      subtitle: 'Vedic 7 Pheras with English Translations • Sacred fire & floral garland vows.',
      startTimeSeconds: 4,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'pan-right',
      overlayTag: 'Day 2 • 11:00 AM',
      venue: 'Palace Mandap Lawn',
      time: 'Day 2 • 11:00 AM',
      ritualNotes: 'Vedic 7 Pheras with English Translations • Sacred fire & floral garland vows.',
      musicMood: 'sacred_ritual',
      audioLabel: 'East-Meets-West Melodic Fusion (Sitar + Cello + Acoustic DJ) (Active)',
    },
    {
      id: 'scene-fc-3',
      sceneNumber: 3,
      title: 'Scene 3: Western Vows & Dual Heritage Unity Candle',
      subtitle: 'Western Vow Exchange & Unity Candle Lighting • Personal vows & ring exchange.',
      startTimeSeconds: 8,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 3 • 04:30 PM',
      venue: 'Glass Pavilion',
      time: 'Day 3 • 04:30 PM',
      ritualNotes: 'Western Vow Exchange & Unity Candle Lighting • Personal vows & ring exchange.',
      musicMood: 'sacred_ritual',
      audioLabel: 'East-Meets-West Melodic Fusion (Sitar + Cello + Acoustic DJ) (Active)',
    },
    {
      id: 'scene-fc-4',
      sceneNumber: 4,
      title: 'Scene 4: Grand Gala Reception & Live Fusion Band',
      subtitle: 'Bilingual Speeches & East-Meets-West Live Orchestra • Global dance floor.',
      startTimeSeconds: 12,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'out',
      overlayTag: 'Day 4 • 08:30 PM',
      venue: 'Grand Ballroom',
      time: 'Day 4 • 08:30 PM',
      ritualNotes: 'Bilingual Speeches & East-Meets-West Live Orchestra • Global dance floor.',
      musicMood: 'formal_gala',
      audioLabel: 'East-Meets-West Melodic Fusion (Sitar + Cello + Acoustic DJ) (Active)',
    },
  ],
  christian_western: [
    {
      id: 'scene-cw-1',
      sceneNumber: 1,
      title: 'Scene 1: Rehearsal Dinner & Toasts',
      subtitle: 'Aisle processional walkthrough, bridal party toasts & acoustic melodies.',
      startTimeSeconds: 0,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 1 • 06:00 PM',
      venue: 'Terrace Garden',
      time: 'Day 1 • 06:00 PM',
      ritualNotes: 'Aisle processional walkthrough, bridal party toasts & acoustic melodies.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Acoustic Symphony & Classical Harmony (Active)',
    },
    {
      id: 'scene-cw-2',
      sceneNumber: 2,
      title: 'Scene 2: Cathedral Vows & Ring Exchange',
      subtitle: 'Sacred Vow Solemnization • Processional, ring exchange & cathedral bells.',
      startTimeSeconds: 4,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'pan-left',
      overlayTag: 'Day 2 • 11:15 AM',
      venue: 'Cathedral Sanctuary',
      time: 'Day 2 • 11:15 AM',
      ritualNotes: 'Sacred Vow Solemnization • Processional, ring exchange & cathedral bells.',
      musicMood: 'sacred_ritual',
      audioLabel: 'Acoustic Symphony & Classical Harmony (Active)',
    },
    {
      id: 'scene-cw-3',
      sceneNumber: 3,
      title: 'Scene 3: Golden Hour String Quartet & Cocktails',
      subtitle: 'Terrace Sunset Cocktail Hour • Live string quartet, hors d’oeuvres & champagne flutes.',
      startTimeSeconds: 8,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'in',
      overlayTag: 'Day 3 • 05:30 PM',
      venue: 'Sunset Terrace',
      time: 'Day 3 • 05:30 PM',
      ritualNotes: 'Terrace Sunset Cocktail Hour • Live string quartet, hors d’oeuvres & champagne flutes.',
      musicMood: 'formal_gala',
      audioLabel: 'Acoustic Symphony & Classical Harmony (Active)',
    },
    {
      id: 'scene-cw-4',
      sceneNumber: 4,
      title: 'Scene 4: Grand Reception & First Dance',
      subtitle: 'First Dance & Multi-Tier Cake Cutting • Black tie celebration & chandeliers.',
      startTimeSeconds: 12,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      zoomDirection: 'out',
      overlayTag: 'Day 4 • 07:45 PM',
      venue: 'Crystal Grand Ballroom',
      time: 'Day 4 • 07:45 PM',
      ritualNotes: 'First Dance & Multi-Tier Cake Cutting • Black tie celebration & chandeliers.',
      musicMood: 'formal_gala',
      audioLabel: 'Acoustic Symphony & Classical Harmony (Active)',
    },
  ],
  hindu: [] as ReelScene[],
  hindu_vedic: [] as ReelScene[],
  muslim: [] as ReelScene[],
  sikh: [] as ReelScene[],
  south_indian_kalyanam: [] as ReelScene[],
  fusion: [] as ReelScene[],
};

// Aliases
SCENE_PRESETS.hindu = SCENE_PRESETS.north_indian;
SCENE_PRESETS.hindu_vedic = SCENE_PRESETS.north_indian;
SCENE_PRESETS.muslim = SCENE_PRESETS.muslim_nikah;
SCENE_PRESETS.sikh = SCENE_PRESETS.punjabi_sikh;
SCENE_PRESETS.south_indian_kalyanam = SCENE_PRESETS.south_indian;
SCENE_PRESETS.fusion = SCENE_PRESETS.fusion_cross_cultural;

/**
 * Returns dynamic, domain-tailored video scenes for the AI Cinematic Short Video Reel.
 * When ceremonies are provided from user planning state, it builds dynamic 4-second scenes per ceremony.
 * Enforces zero duplicate scenes so Scene 2 and Scene 5 never share the same image.
 */
export function getVideoReelScenes(
  domain: EventDomain,
  eventTitle = '',
  culture: WeddingCulture = 'north_indian',
  ceremonies?: CeremonyItem[]
): VideoScene[] {
  const cleanTitle = sanitizeInput(eventTitle || 'Grand Celebration');

  // Strict Cultural Scene Presets for Wedding domain
  if (domain === 'wedding') {
    // If specific custom ad-hoc ceremonies were passed (e.g., custom unit test ceremonies with id 'c1', 'c2')
    const isCustomAdHoc =
      Array.isArray(ceremonies) &&
      ceremonies.length > 0 &&
      ceremonies.some((c) => c.id?.startsWith('c') && !c.id?.startsWith('cw'));

    if (!isCustomAdHoc) {
      return SCENE_PRESETS[culture as TraditionType] || SCENE_PRESETS.north_indian;
    }
  }

  // DYNAMIC USER PLANNING PIPELINE:
  // If ceremonies exist from user-created or modified schedule, build 100% data-driven scenes!
  // Bounded strictly: minimum 3 scenes, maximum 6 scenes.
  if (Array.isArray(ceremonies) && ceremonies.length > 0) {
    let effectiveCeremonies = ceremonies.slice(0, 6);
    if (effectiveCeremonies.length < 3) {
      const padOptions: CeremonyItem[] = [
        { name: 'Sacred Ritual Gathering', venue: 'Palace Mandap Courtyard', time: '11:00 AM', attireCode: 'Traditional Silk', ritualNotes: 'Auspicious prayers and family blessings' },
        { name: 'Celebration Feast & Toast', venue: 'Grand Banquet Lawn', time: '01:30 PM', attireCode: 'Festive Royal', ritualNotes: 'Traditional banquet feast and celebration' },
        { name: 'Musical Night & Grand Finale', venue: 'Illuminated Amphitheater', time: '07:30 PM', attireCode: 'Formal Elegance', ritualNotes: 'Music, dance, and twilight send-off' },
      ];
      while (effectiveCeremonies.length < 3) {
        effectiveCeremonies.push(padOptions[effectiveCeremonies.length]);
      }
    }

    const usedUrls = new Set<string>();

    return effectiveCeremonies.map((c, idx) => {
      const visual = resolveSceneVisual(c, idx, culture, usedUrls);
      usedUrls.add(visual.imageUrl);

      const sceneNumber = idx + 1;
      const startTimeSeconds = idx * 4;
      const durationSeconds = 4;
      const rawName = c.name || c.title || `Ceremony ${sceneNumber}`;
      const title = sanitizeInput(`Scene ${sceneNumber}: ${rawName}`);

      const dayLabel = c.date ? `Day ${idx + 1} (${c.date})` : `Day ${idx + 1}`;
      const timeLabel = c.startTime || c.time || '10:00 AM';
      const venueLabel = c.venue || c.location || 'Main Pavilion';
      const attireLabel = c.attireCode ? `👗 ${c.attireCode}` : '';
      const notesLabel = c.ritualNotes || c.description || '';

      const subtitleParts = [
        `${dayLabel} • ${cleanTitle}`,
        venueLabel,
        attireLabel,
        notesLabel,
      ].filter(Boolean);

      const subtitle = sanitizeInput(subtitleParts.join(' • '));
      const overlayTag = sanitizeInput(`${dayLabel} • ${timeLabel}`);

      return {
        id: c.id ? `scene-dynamic-${c.id}` : `scene-dynamic-${idx + 1}`,
        sceneNumber,
        title,
        subtitle,
        startTimeSeconds,
        durationSeconds,
        imageUrl: visual.imageUrl,
        zoomDirection: (['in', 'pan-right', 'pan-left', 'out'] as const)[idx % 4],
        overlayTag,
        venue: c.venue || c.location,
        time: timeLabel,
        attireCode: c.attireCode,
        ritualNotes: notesLabel,
        matchedKeyword: visual.keywordMatched,
        musicMood: visual.musicMood,
        audioLabel: getCultureAudioSoundscape(culture, domain),
      };
    });
  }

  if (domain === 'wedding') {
    return SCENE_PRESETS[culture as TraditionType] || SCENE_PRESETS.north_indian;
  }

  if (domain === 'birthday') {
    return [
      {
        id: 'scene-b1',
        sceneNumber: 1,
        title: 'Scene 1: VIP Guest Arrival & Superhero Academy',
        subtitle: `Phase 1 • ${cleanTitle} • Neon welcome portal, hero cape fitting & VIP badge reveal`,
        startTimeSeconds: 0,
        durationSeconds: 4,
        imageUrl: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=1400&q=85',
        zoomDirection: 'in',
        overlayTag: 'Phase 1 • 03:00 PM',
      },
      {
        id: 'scene-b2',
        sceneNumber: 2,
        title: 'Scene 2: Cosmic Laser Quest & Arcade Arena',
        subtitle: 'Phase 2 • Neon Laser Quests • Dynamic laser tag showdowns & 360-video glitz booth',
        startTimeSeconds: 4,
        durationSeconds: 4,
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1400&q=85',
        zoomDirection: 'pan-left',
        overlayTag: 'Phase 2 • 04:30 PM',
      },
      {
        id: 'scene-b3',
        sceneNumber: 3,
        title: 'Scene 3: The Grand Cake Spectacle & Countdown',
        subtitle: 'Phase 3 • Milestone Cake Moment • Triple Belgian chocolate tower with sparkling candles',
        startTimeSeconds: 8,
        durationSeconds: 5,
        imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85',
        zoomDirection: 'in',
        overlayTag: 'Phase 3 • 05:45 PM',
      },
      {
        id: 'scene-b4',
        sceneNumber: 4,
        title: 'Scene 4: Midnight Glow Dance & Mystery Favors',
        subtitle: 'Phase 4 • Cosmic Confetti Finale • High-energy dance floor and personalized hero loot bags',
        startTimeSeconds: 13,
        durationSeconds: 5,
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=85',
        zoomDirection: 'out',
        overlayTag: 'Phase 4 • 06:30 PM',
      },
    ];
  }

  return [
    {
      id: 'scene-c1',
      sceneNumber: 1,
      title: 'Scene 1: Morning Gates Open & Artisan Village',
      subtitle: `Act 1 • ${cleanTitle} • 45 neighborhood craft stalls, coffee wagons & welcome fanfare`,
      startTimeSeconds: 0,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=85',
      zoomDirection: 'in',
      overlayTag: 'Act 1 • 10:00 AM',
    },
    {
      id: 'scene-c2',
      sceneNumber: 2,
      title: 'Scene 2: Collaborative Giant Mosaic & Food Taste',
      subtitle: 'Act 2 • Living Community Art • 1,500 residents painting unity tiles & culinary tasting',
      startTimeSeconds: 4,
      durationSeconds: 4,
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=85',
      zoomDirection: 'pan-right',
      overlayTag: 'Act 2 • 01:00 PM',
    },
    {
      id: 'scene-c3',
      sceneNumber: 3,
      title: 'Scene 3: Mainstage Acoustic Keynote & Awards',
      subtitle: 'Act 3 • Civic Recognition • Youth choir, acoustic folk performance & civic honors',
      startTimeSeconds: 8,
      durationSeconds: 5,
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85',
      zoomDirection: 'in',
      overlayTag: 'Act 3 • 04:30 PM',
    },
    {
      id: 'scene-c4',
      sceneNumber: 4,
      title: 'Scene 4: Twilight Lantern Lighting & Drone Finale',
      subtitle: 'Act 4 • Twilight Illumination • 500 solar festoon lanterns glowing across the park',
      startTimeSeconds: 13,
      durationSeconds: 5,
      imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=85',
      zoomDirection: 'out',
      overlayTag: 'Act 4 • 07:45 PM',
    },
  ];
}
