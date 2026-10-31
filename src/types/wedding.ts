export type WeddingCulture =
  | 'north_indian'
  | 'punjabi_sikh'
  | 'south_indian'
  | 'muslim_nikah'
  | 'christian_western'
  | 'fusion_cross_cultural';

export interface WeddingScheduleDay {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  attireCode: string;
  ritualNotes: string;
  ritualTags?: string[];
  pujaItems?: string[];
  dietaryRule?: string;
  muhurthamTiming?: string;
}

export type RsvpStatus = 'Attending' | 'Declined' | 'Pending';

export type DietaryRestriction =
  | 'None'
  | 'Vegetarian'
  | 'Vegan'
  | 'Jain'
  | 'Halal'
  | 'Kosher'
  | 'Gluten-Free'
  | 'Nut Allergy'
  | 'Dairy-Free';

export type GuestSide = 'Bride' | 'Groom' | 'Mutual';

export interface GuestRsvpItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  rsvpStatus: RsvpStatus;
  dietaryRestriction: DietaryRestriction;
  plusOneCount: number;
  tableId?: string;
  isVip: boolean;
  side?: GuestSide;
  notes?: string;
}

export interface TableSeatingItem {
  id: string;
  tableNumber: number;
  tableName: string;
  capacity: number;
  isVip: boolean;
  shape: 'Round' | 'Rectangular' | 'Square';
  assignedGuestIds: string[];
}

export type BridalPartyRole =
  | 'Maid of Honor'
  | 'Best Man'
  | 'Bridesmaid'
  | 'Groomsman'
  | 'Parent'
  | 'Flower Girl / Ring Bearer'
  | 'Pandit / Officiant Coordinator'
  | 'Safa & Turban Tying Lead'
  | 'Dhol & Procession Captain'
  | 'Trousseau & Jewelry Custodian'
  | 'Fleet & Transport Manager'
  | 'Nikah Registrar & Vakil';

export interface BridalPartyMember {
  id: string;
  name: string;
  role: BridalPartyRole;
  phone: string;
  callTime: string;
  hairMakeupSlot: string;
  dressingRoom: string;
  assignedTransport: string;
  isReady: boolean;
}

export interface CulturalTraditionPreset {
  id: WeddingCulture;
  displayName: string;
  icon: string;
  tagline: string;
  defaultAttire: string;
  musicPreset: string;
  dietaryPreset: string;
  ceremonies: WeddingScheduleDay[];
  culturalBudgetRecommendations: {
    name: string;
    category: 'venue' | 'catering' | 'decor' | 'media' | 'contingency';
    estimatedCost: number;
  }[];
}
