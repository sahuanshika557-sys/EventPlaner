import type { BudgetLineItem } from './budget';
import type { MacroMilestone, TimelineEntry } from './timeline';
import type { VendorItem } from './vendor';
import type { AIConceptIdea } from './ai';
import type { WeddingScheduleDay, GuestRsvpItem, TableSeatingItem, BridalPartyMember, WeddingCulture } from './wedding';
import type { BirthdayFlowState } from './birthday';
import type { PublicSpacePermitItem, SafetyChecklistItem, VolunteerShiftItem, CrowdSafetyProtocol } from './community';

export type EventDomain = 'wedding' | 'birthday' | 'community';

export interface BaseEventData {
  id: string;
  domain: EventDomain;
  title: string;
  tagline: string;
  date: string;
  location: string;
  totalBudget: number;
  currency: string;
  guestCount: number;
  updatedAt: string;
}

export interface WeddingSpecificData {
  culture?: WeddingCulture;
  scheduleDays: WeddingScheduleDay[];
  guests: GuestRsvpItem[];
  tables: TableSeatingItem[];
  bridalParty: BridalPartyMember[];
}

export interface CommunitySpecificData {
  permits: PublicSpacePermitItem[];
  safetyChecklist: SafetyChecklistItem[];
  volunteerShifts: VolunteerShiftItem[];
  crowdSafety: CrowdSafetyProtocol;
}

export interface EventModel extends BaseEventData {
  budgetItems: BudgetLineItem[];
  macroMilestones: MacroMilestone[];
  runOfShow: TimelineEntry[];
  vendors: VendorItem[];
  savedAIIdeas: AIConceptIdea[];
  
  // Domain specific sub-state
  weddingData?: WeddingSpecificData;
  birthdayData?: BirthdayFlowState;
  communityData?: CommunitySpecificData;
}
