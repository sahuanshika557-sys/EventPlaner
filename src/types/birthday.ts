export type BirthdayCategoryTier = 'kids' | 'sweet16' | 'adult';

export interface BirthdayThemeOption {
  id: string;
  category: BirthdayCategoryTier;
  milestoneTitle: string; // e.g., '5th Dino Adventure', 'Sweet 16 Glow Glam', '30th Vintage Speakeasy', '50th Golden Jubilee'
  suggestedColors: string[];
  vibeDescription: string;
}

export interface CakeAndGameTimelineItem {
  id: string;
  time: string;
  type: 'cake' | 'game' | 'toast' | 'performance';
  title: string;
  hostOrLead: string;
  musicCue: string;
  propsRequired: string;
  durationMinutes: number;
  isCompleted: boolean;
}

export interface PartyFavorItem {
  id: string;
  itemName: string;
  targetCount: number;
  preparedCount: number;
  unitCost: number;
  packagingStatus: 'Pending' | 'In Assembly' | 'Ready' | 'Distributed';
  recipientGroup: 'Kids' | 'Teens' | 'Adults' | 'VIPs';
  distributionStation: string;
}

export interface BirthdayFlowState {
  selectedCategory: BirthdayCategoryTier;
  selectedMilestone: string;
  themeTitle: string;
  celebrantName: string;
  ageCelebrating: number;
  cakeFlavor: string;
  specialRequests: string;
  cakeAndGames: CakeAndGameTimelineItem[];
  partyFavors: PartyFavorItem[];
}
