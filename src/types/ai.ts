export interface DecorConcept {
  id: string;
  themeTitle: string;
  colorPalette: { name: string; hex: string }[];
  tablescapeDetails: string;
  centerpieceConcept: string;
  entranceFocalPoint: string;
  estimatedBudgetImpact: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface LightingSchematic {
  id: string;
  name: string;
  moodType: string;
  zones: {
    zoneName: string;
    fixtureType: string;
    colorTemperature: string;
    instructions: string;
  }[];
  specialEffects: string[];
  imageUrl?: string;
  imagePrompt?: string;
}

export interface InteractiveEngagementIdea {
  id: string;
  title: string;
  targetDemographic: string;
  format: string; // e.g., 'Live Guestbook Ritual', 'Digital Photo Challenge', 'Interactive Tasting Station'
  description: string;
  executionSteps: string[];
  engagementFactor: number; // 1-10 rating
  imageUrl?: string;
  imagePrompt?: string;
}

export interface AIConceptIdea {
  id: string;
  generatedAt: string;
  eventType: 'wedding' | 'birthday' | 'community';
  themePrompt: string;
  decorConcept: DecorConcept;
  lightingSchematic: LightingSchematic;
  engagementIdeas: InteractiveEngagementIdea[];
  decorImageUrl?: string;
  lightingImageUrl?: string;
  experienceImageUrl?: string;
}

import type { WeddingCulture } from './wedding';

export interface AIEngineParams {
  eventType: 'wedding' | 'birthday' | 'community';
  theme: string;
  guestCount?: number;
  demographics?: string;
  budgetTier?: 'Intimate / Budget-Conscious' | 'Classic Elegance' | 'Luxury Grand Spectacle';
  venueEnvironment?: 'Indoor Ballroom' | 'Outdoor Garden/Park' | 'Hybrid / Pavilion' | 'Urban Loft';
  culture?: WeddingCulture;
}

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

export interface VideoScene {
  id: string;
  dayBadge?: string;
  timeBadge?: string;
  venueBadge?: string;
  attireBadge?: string;
  title: string;
  subtitle: string;
  audioBadge?: string;
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

export type ReelScene = VideoScene;
export type TraditionType =
  | WeddingCulture
  | 'hindu'
  | 'hindu_vedic'
  | 'muslim'
  | 'sikh'
  | 'south_indian_kalyanam'
  | 'fusion';

export interface VideoReelConfig {
  eventTitle: string;
  domain: 'wedding' | 'birthday' | 'community';
  totalDurationSeconds: number;
  scenes: VideoScene[];
}

export interface ImageSourceConfig {
  primaryUrl: string;
  fallbackUrl: string;
  alt: string;
  caption?: string;
}

export interface ConceptCardData {
  id: string;
  title: string;
  budgetImpact: string;
  imageUrl: string;
  imagePrompt: string;
  details: string[];
}
