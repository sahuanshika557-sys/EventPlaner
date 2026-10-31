export type ReelEventType = 'wedding' | 'birthday' | 'community';

export type IndianCulture =
  | 'punjabi'
  | 'bengali'
  | 'gujarati'
  | 'rajasthani'
  | 'marathi'
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'malayalam'
  | 'kashmiri'
  | 'north_indian'
  | 'south_indian'
  | 'custom';

export type ReelLanguage =
  | 'english'
  | 'hindi'
  | 'hinglish'
  | 'punjabi'
  | 'bengali'
  | 'gujarati'
  | 'marathi'
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'malayalam';

export type ReelStyle =
  | 'cinematic'
  | 'traditional'
  | 'energetic'
  | 'emotional'
  | 'modern';

export type WeddingFunction =
  | 'mehndi'
  | 'haldi'
  | 'sangeet'
  | 'baraat'
  | 'wedding_ceremony'
  | 'reception';

export type BirthdayTheme = 'Royal' | 'Bollywood' | 'Floral' | 'Minimal' | 'Party';

export type CommunityType =
  | 'Cultural Gathering'
  | 'Society Celebration'
  | 'Local Celebration'
  | 'Community Festival'
  | 'Cultural Program';

export interface CultureProfile {
  id: IndianCulture;
  cultureName: string;
  religiousContext?: string;
  region: string;
  traditionalAttire: string;
  brideAttire?: string;
  groomAttire?: string;
  familyAttire?: string;
  weddingRituals?: string[];
  ceremonyElements?: string[];
  decorations?: string;
  decorationStyle: string;
  flowers?: string[];
  architecture?: string;
  foodReferences?: string[];
  culturalElements: string[];
  rituals: string[];
  musicStyle: string;
  instruments: string[];
  danceStyle?: string;
  visualKeywords: string[];
  sceneKeywords?: Record<string, string[]>;
  languageOptions: ReelLanguage[];
  captionStyle: string;
  avoidKeywords: string[];
  negativeKeywords?: string[];
  palette: { name: string; hex: string }[];
}

export interface ReelSceneData {
  id: string;
  sceneNumber: number;
  title: string;
  duration: number; // in seconds
  purpose: 'hook' | 'identity' | 'culture' | 'ritual' | 'celebration_peak' | 'finale';
  visualPrompt: string;
  videoPrompt: string;
  caption: string;
  subtitle: string;
  voiceover: string;
  culturalElements: string[];
  musicCue: string;
  transition: 'dissolve' | 'fade-to-black' | 'whip-pan' | 'zoom-blur' | 'light-leak';
  cameraMotion: 'slow-pan-left' | 'slow-pan-right' | 'push-in' | 'pull-out' | 'steady-orbit';
  imageUrl: string;
  dayBadge: string;
  timeBadge: string;
  venueBadge: string;
  attireBadge: string;
  audioBadge: string;
  whyThisScene: string;
  whyThisVisual: string;
  cultureMatchScore: number;
  sceneMatchScore: number;
  eventMatchScore: number;
  negativePrompt?: string;
  searchQuery?: string;
  hasMismatch?: boolean;
  isUserPhoto?: boolean;
  userPhotoUrl?: string;
}

export interface CreativeBrief {
  eventType: ReelEventType;
  title: string;
  subtitle: string;
  culture: IndianCulture;
  cultureName: string;
  language: ReelLanguage;
  style: ReelStyle;
  durationSeconds: number;
  storyConcept: string;
  emotionalArc: string;
  targetAudience: string;
  visualTone: string;
  musicDirection: string;
}

export interface CulturalCheckItem {
  id: string;
  name: string;
  passed: boolean;
  detail: string;
}

export interface CulturalConsistencyReport {
  alignmentScore: number; // 0 - 100%
  checks: CulturalCheckItem[];
  label: string; // "AI-generated quality estimate, not an official cultural certification"
}

export interface WeddingInputs {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  city: string;
  selectedFunctions: WeddingFunction[];
  guestCount: number;
  theme: string;
  mood: string;
  musicPreference: string;
  specialMessage: string;
  uploadedPhotos: string[];
}

export interface BirthdayInputs {
  birthdayPersonName: string;
  age: number;
  date: string;
  venue: string;
  city: string;
  theme: BirthdayTheme | string;
  mood: string;
  musicPreference: string;
  specialMessage: string;
  uploadedPhotos: string[];
}

export interface CommunityInputs {
  eventName: string;
  eventDate: string;
  venue: string;
  city: string;
  communityType: CommunityType;
  mainActivities: string;
  theme: string;
  mood: string;
  musicPreference: string;
  specialMessage: string;
  uploadedPhotos: string[];
}

export interface ReelGeneratorInput {
  eventType: ReelEventType;
  culture: IndianCulture;
  language: ReelLanguage;
  style: ReelStyle;
  weddingDetails?: WeddingInputs;
  birthdayDetails?: BirthdayInputs;
  communityDetails?: CommunityInputs;
}

export interface GenerationStepState {
  stepNumber: number;
  title: string;
  status: 'pending' | 'active' | 'complete' | 'failed';
  detailMessage?: string;
}
