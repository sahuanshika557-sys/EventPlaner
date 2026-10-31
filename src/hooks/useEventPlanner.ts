import { useState, useEffect, useCallback } from 'react';
import type { EventModel, EventDomain } from '../types/event';
import type { BudgetLineItem } from '../types/budget';
import type { MacroMilestone, TimelineEntry } from '../types/timeline';
import type { VendorItem } from '../types/vendor';
import type { AIConceptIdea } from '../types/ai';
import type { GuestRsvpItem, TableSeatingItem, BridalPartyMember, WeddingScheduleDay, WeddingCulture } from '../types/wedding';
import type { CakeAndGameTimelineItem, PartyFavorItem } from '../types/birthday';
import type { PublicSpacePermitItem, SafetyChecklistItem, VolunteerShiftItem, CrowdSafetyProtocol } from '../types/community';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { INITIAL_WEDDING_EVENT, INITIAL_BIRTHDAY_EVENT, INITIAL_COMMUNITY_EVENT } from '../data/defaultEvents';
import { getCulturalPreset } from '../data/culturalTraditions';

const DOMAIN_DEFAULTS: Record<EventDomain, EventModel> = {
  wedding: INITIAL_WEDDING_EVENT,
  birthday: INITIAL_BIRTHDAY_EVENT,
  community: INITIAL_COMMUNITY_EVENT,
};

export function useEventPlanner() {
  const [activeDomain, setActiveDomain] = useState<EventDomain>(() => {
    return loadFromStorage<EventDomain>('active_domain', 'wedding');
  });

  const [events, setEvents] = useState<Record<EventDomain, EventModel>>(() => {
    const saved = loadFromStorage<Record<EventDomain, EventModel> | null>('events_map', null);
    if (saved && saved.wedding && saved.birthday && saved.community) {
      return saved;
    }
    return DOMAIN_DEFAULTS;
  });

  // Current active event model
  const currentEvent: EventModel = events[activeDomain] || DOMAIN_DEFAULTS[activeDomain];

  // Persist whenever events change
  useEffect(() => {
    saveToStorage('events_map', events);
  }, [events]);

  useEffect(() => {
    saveToStorage('active_domain', activeDomain);
  }, [activeDomain]);

  // Domain Switcher
  const switchDomain = useCallback((domain: EventDomain) => {
    setActiveDomain(domain);
  }, []);

  // Custom Event Creator (from Onboarding Flow)
  const createCustomEvent = useCallback((newEvent: EventModel) => {
    setEvents((prev) => ({
      ...prev,
      [newEvent.domain]: newEvent,
    }));
    setActiveDomain(newEvent.domain);
  }, []);

  // Generic updater for current event
  const updateCurrentEvent = useCallback(
    (updater: (prev: EventModel) => EventModel) => {
      setEvents((prevMap) => {
        const target = prevMap[activeDomain] || DOMAIN_DEFAULTS[activeDomain];
        const updated = updater(target);
        return {
          ...prevMap,
          [activeDomain]: {
            ...updated,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [activeDomain]
  );

  // Budget items updater
  const updateBudgetItems = useCallback(
    (items: BudgetLineItem[]) => {
      updateCurrentEvent((prev) => ({ ...prev, budgetItems: items }));
    },
    [updateCurrentEvent]
  );

  const updateTotalBudget = useCallback(
    (totalBudget: number) => {
      updateCurrentEvent((prev) => ({ ...prev, totalBudget }));
    },
    [updateCurrentEvent]
  );

  const updateCurrency = useCallback(
    (currency: string) => {
      updateCurrentEvent((prev) => ({ ...prev, currency }));
    },
    [updateCurrentEvent]
  );

  // Timeline updaters
  const updateMacroMilestones = useCallback(
    (milestones: MacroMilestone[]) => {
      updateCurrentEvent((prev) => ({ ...prev, macroMilestones: milestones }));
    },
    [updateCurrentEvent]
  );

  const updateRunOfShow = useCallback(
    (entries: TimelineEntry[]) => {
      updateCurrentEvent((prev) => ({ ...prev, runOfShow: entries }));
    },
    [updateCurrentEvent]
  );

  // Vendor updater
  const updateVendors = useCallback(
    (vendors: VendorItem[]) => {
      updateCurrentEvent((prev) => ({ ...prev, vendors }));
    },
    [updateCurrentEvent]
  );

  // AI Idea persistence
  const saveAIIdea = useCallback(
    (idea: AIConceptIdea) => {
      updateCurrentEvent((prev) => ({
        ...prev,
        savedAIIdeas: [idea, ...prev.savedAIIdeas],
      }));
    },
    [updateCurrentEvent]
  );

  // Wedding-specific actions
  const updateWeddingCulture = useCallback(
    (culture: WeddingCulture) => {
      const preset = getCulturalPreset(culture);
      updateCurrentEvent((prev) => {
        if (!prev.weddingData) return prev;
        return {
          ...prev,
          weddingData: {
            ...prev.weddingData,
            culture,
            scheduleDays: preset.ceremonies,
          },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateWeddingScheduleDays = useCallback(
    (days: WeddingScheduleDay[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.weddingData) return prev;
        return {
          ...prev,
          weddingData: { ...prev.weddingData, scheduleDays: days },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateGuests = useCallback(
    (guests: GuestRsvpItem[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.weddingData) return prev;
        return {
          ...prev,
          weddingData: { ...prev.weddingData, guests },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateTables = useCallback(
    (tables: TableSeatingItem[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.weddingData) return prev;
        return {
          ...prev,
          weddingData: { ...prev.weddingData, tables },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateBridalParty = useCallback(
    (bridalParty: BridalPartyMember[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.weddingData) return prev;
        return {
          ...prev,
          weddingData: { ...prev.weddingData, bridalParty },
        };
      });
    },
    [updateCurrentEvent]
  );

  // Birthday-specific actions
  const updateBirthdayGames = useCallback(
    (cakeAndGames: CakeAndGameTimelineItem[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.birthdayData) return prev;
        return {
          ...prev,
          birthdayData: { ...prev.birthdayData, cakeAndGames },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updatePartyFavors = useCallback(
    (favors: PartyFavorItem[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.birthdayData) return prev;
        return {
          ...prev,
          birthdayData: { ...prev.birthdayData, partyFavors: favors },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateBirthdayDetails = useCallback(
    (updates: { celebrantName?: string; ageCelebrating?: number; cakeFlavor?: string; themeTitle?: string }) => {
      updateCurrentEvent((prev) => {
        if (!prev.birthdayData) return prev;
        return {
          ...prev,
          birthdayData: { ...prev.birthdayData, ...updates },
        };
      });
    },
    [updateCurrentEvent]
  );

  // Community-specific actions
  const updateCommunityPermits = useCallback(
    (permits: PublicSpacePermitItem[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.communityData) return prev;
        return {
          ...prev,
          communityData: { ...prev.communityData, permits },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateSafetyChecklist = useCallback(
    (checklist: SafetyChecklistItem[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.communityData) return prev;
        return {
          ...prev,
          communityData: { ...prev.communityData, safetyChecklist: checklist },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateVolunteerShifts = useCallback(
    (shifts: VolunteerShiftItem[]) => {
      updateCurrentEvent((prev) => {
        if (!prev.communityData) return prev;
        return {
          ...prev,
          communityData: { ...prev.communityData, volunteerShifts: shifts },
        };
      });
    },
    [updateCurrentEvent]
  );

  const updateCrowdSafety = useCallback(
    (updates: Partial<CrowdSafetyProtocol>) => {
      updateCurrentEvent((prev) => {
        if (!prev.communityData) return prev;
        return {
          ...prev,
          communityData: {
            ...prev.communityData,
            crowdSafety: { ...prev.communityData.crowdSafety, ...updates },
          },
        };
      });
    },
    [updateCurrentEvent]
  );

  // Reset to default seed data
  const resetToFactoryDefaults = useCallback(() => {
    setEvents(DOMAIN_DEFAULTS);
  }, []);

  return {
    activeDomain,
    switchDomain,
    currentEvent,
    updateBudgetItems,
    updateTotalBudget,
    updateCurrency,
    updateMacroMilestones,
    updateRunOfShow,
    updateVendors,
    saveAIIdea,
    updateWeddingCulture,
    updateWeddingScheduleDays,
    updateGuests,
    updateTables,
    updateBridalParty,
    updateBirthdayGames,
    updatePartyFavors,
    updateBirthdayDetails,
    updateCommunityPermits,
    updateSafetyChecklist,
    updateVolunteerShifts,
    updateCrowdSafety,
    createCustomEvent,
    resetToFactoryDefaults,
  };
}
