import type { TimelineEntry, ScheduleConflict, MacroMilestone, MacroPhase } from '../types/timeline';

/**
 * Parses either 24-hour (HH:mm) or 12-hour (hh:mm AM/PM) time into minutes since midnight.
 * Handles variations like "9:00 AM", "09:00am", "14:30", "2:30 PM".
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;

  const clean = timeStr.trim().toUpperCase();

  // Match 12-hour format: e.g. "09:30 AM", "2:15PM", "12:00 AM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3];

    if (hours === 12) {
      hours = meridian === 'AM' ? 0 : 12;
    } else if (meridian === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  // Match 24-hour format: e.g. "14:30", "09:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
}

/**
 * Converts minutes since midnight into a clean 12-hour AM/PM string
 */
export function minutesTo12Hour(minutes: number): string {
  const safeMin = Math.max(0, minutes % 1440);
  let hours = Math.floor(safeMin / 60);
  const mins = safeMin % 60;
  const meridian = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`;

  return `${paddedHours}:${paddedMins} ${meridian}`;
}

/**
 * Calculates end time based on start time string and duration in minutes
 */
export function calculateEndTime(startTimeStr: string, durationMinutes: number): string {
  const startMin = parseTimeToMinutes(startTimeStr);
  const endMin = startMin + durationMinutes;
  return minutesTo12Hour(endMin);
}

/**
 * Chronologically sorts timeline entries supporting mixed 12-hour and 24-hour inputs
 */
export function sortTimelineChronologically(entries: TimelineEntry[]): TimelineEntry[] {
  return [...entries].sort((a, b) => {
    const minA = parseTimeToMinutes(a.time);
    const minB = parseTimeToMinutes(b.time);
    return minA - minB;
  });
}

/**
 * Checks for schedule conflicts (location clash or owner clash during overlapping time windows)
 */
export function detectTimelineConflicts(entries: TimelineEntry[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const sorted = sortTimelineChronologically(entries);

  for (let i = 0; i < sorted.length; i++) {
    const itemA = sorted[i];
    const startA = parseTimeToMinutes(itemA.time);
    const endA = startA + (itemA.durationMinutes || 30);

    for (let j = i + 1; j < sorted.length; j++) {
      const itemB = sorted[j];
      const startB = parseTimeToMinutes(itemB.time);
      const endB = startB + (itemB.durationMinutes || 30);

      // If start of B is after or equal to end of A, no overlap possible with subsequent sorted items
      if (startB >= endA) {
        break;
      }

      // Overlap detected: [startA, endA) and [startB, endB) overlap
      const hasTimeOverlap = startB < endA && endB > startA;

      if (hasTimeOverlap) {
        const sameLocation = 
          itemA.location && 
          itemB.location && 
          itemA.location.toLowerCase() === itemB.location.toLowerCase();

        const sameOwner = 
          itemA.owner && 
          itemB.owner && 
          itemA.owner.toLowerCase() === itemB.owner.toLowerCase();

        if (sameLocation) {
          conflicts.push({
            entryId1: itemA.id,
            entryId2: itemB.id,
            title1: itemA.title,
            title2: itemB.title,
            time1: itemA.time,
            time2: itemB.time,
            conflictType: 'location',
            details: `Location clash at "${itemA.location}" between "${itemA.title}" and "${itemB.title}".`,
          });
        } else if (sameOwner) {
          conflicts.push({
            entryId1: itemA.id,
            entryId2: itemB.id,
            title1: itemA.title,
            title2: itemB.title,
            time1: itemA.time,
            time2: itemB.time,
            conflictType: 'owner',
            details: `Owner clash: "${itemA.owner}" is double-booked for "${itemA.title}" and "${itemB.title}".`,
          });
        } else {
          conflicts.push({
            entryId1: itemA.id,
            entryId2: itemB.id,
            title1: itemA.title,
            title2: itemB.title,
            time1: itemA.time,
            time2: itemB.time,
            conflictType: 'overlap',
            details: `Concurrent scheduled activities: "${itemA.title}" and "${itemB.title}".`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Calculates days remaining between today and an event date string
 */
export function calculateDaysRemaining(targetDateStr: string, currentTimestamp = Date.now()): number {
  try {
    const eventTime = new Date(targetDateStr).getTime();
    const diff = Math.ceil((eventTime - currentTimestamp) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 30;
  }
}

/**
 * Calculates a date offset from the target event date (e.g. -90 days for T-90).
 * Returns ISO date string (YYYY-MM-DD).
 */
export function calculateMilestoneDate(eventDateStr: string, daysOffset: number): string {
  try {
    const base = new Date(eventDateStr);
    if (isNaN(base.getTime())) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 90 + daysOffset);
      return fallback.toISOString().split('T')[0];
    }
    const target = new Date(base.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return target.toISOString().split('T')[0];
  } catch {
    return eventDateStr;
  }
}

export interface AutoMilestoneTemplate {
  offsetDays: number;
  phase: MacroPhase;
  phaseTitle: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const DOMAIN_MILESTONE_TEMPLATES: Record<string, AutoMilestoneTemplate[]> = {
  wedding: [
    {
      offsetDays: -90,
      phase: 'T-90 days',
      phaseTitle: 'Venue & Creative Vision',
      title: 'Lock Venue Contract & Key Vendors',
      description: 'Execute agreements with venue banquet, lead photographer, and floral designer with deposits paid.',
      priority: 'high',
    },
    {
      offsetDays: -60,
      phase: 'T-60 days',
      phaseTitle: 'Invitations & Attire',
      title: 'Dispatch Official Invitations & RSVP Portal',
      description: 'Send printed/digital invites, activate RSVP tracker, and schedule bridal fitting sessions.',
      priority: 'high',
    },
    {
      offsetDays: -30,
      phase: 'T-30 days',
      phaseTitle: 'Tasting & Run-of-Show Draft',
      title: 'Catering Tasting & Timeline Walkthrough',
      description: 'Finalize ceremonial menus with dietary tags and draft minute-by-minute run-of-show with MC/DJ.',
      priority: 'medium',
    },
    {
      offsetDays: -7,
      phase: 'T-7 days',
      phaseTitle: 'Final Headcount & Staging',
      title: 'Lock Seating Chart & Vendor Call Times',
      description: 'Deliver final guarantee to caterer, verify table seating matrix, and confirm logistics load-in slots.',
      priority: 'high',
    },
    {
      offsetDays: -1,
      phase: 'T-1 day',
      phaseTitle: 'Ceremony Rehearsal',
      title: 'Run-Through & Soundcheck',
      description: 'Bridal party walkthrough, audio levels calibration, and puja samagri inspection.',
      priority: 'high',
    },
  ],
  birthday: [
    {
      offsetDays: -90,
      phase: 'T-90 days',
      phaseTitle: 'Theme & Venue Lock',
      title: 'Lock Party Theme & Reserve Dome / Hall',
      description: 'Confirm party date, reserve entertainment venue or private space, and set budget ceiling.',
      priority: 'high',
    },
    {
      offsetDays: -60,
      phase: 'T-60 days',
      phaseTitle: 'Talent & Entertainment',
      title: 'Book DJ, Magician, or Game Hosts',
      description: 'Contract entertainers, costumed animators, and request specialized interactive equipment.',
      priority: 'medium',
    },
    {
      offsetDays: -30,
      phase: 'T-30 days',
      phaseTitle: 'RSVPs & Cake Design',
      title: 'Order Custom 3D Cake & Send Invites',
      description: 'Lock in cake flavor and dietary options, launch digital RSVP invites for classmates/friends.',
      priority: 'high',
    },
    {
      offsetDays: -7,
      phase: 'T-7 days',
      phaseTitle: 'Favors & Game Supplies',
      title: 'Assemble Goodie Bags & Game Props',
      description: 'Prepare custom favor capes, piñata fillers, game prizes, and verify allergy notes.',
      priority: 'high',
    },
    {
      offsetDays: -1,
      phase: 'T-1 day',
      phaseTitle: 'Final Staging',
      title: 'Balloon Arch Prep & Playlist Check',
      description: 'Coordinate balloon installation timing, charge bluetooth mics, and confirm cake pickup.',
      priority: 'medium',
    },
  ],
  community: [
    {
      offsetDays: -90,
      phase: 'T-90 days',
      phaseTitle: 'Municipal Permits',
      title: 'Submit Parks & Sound Amplification Permits',
      description: 'File applications with City Parks, Police District, and transportation traffic bureau.',
      priority: 'high',
    },
    {
      offsetDays: -60,
      phase: 'T-60 days',
      phaseTitle: 'Vendor Curation',
      title: 'Publish Food Truck & Artisan Criteria',
      description: 'Distribute health inspection regulations, collect proof of insurance, and allocate stall spots.',
      priority: 'high',
    },
    {
      offsetDays: -30,
      phase: 'T-30 days',
      phaseTitle: 'Safety & Staging',
      title: 'Book First Aid, Sanitation & Generators',
      description: 'Contract paramedic ambulance, portable ADA sanitation stations, and solar-hybrid power generators.',
      priority: 'high',
    },
    {
      offsetDays: -7,
      phase: 'T-7 days',
      phaseTitle: 'Volunteer Mobilization',
      title: 'Volunteer Crowd Marshall Safety Briefing',
      description: 'Train 30 community marshals on radio protocols, AED locations, lost-child tent, and crowd control.',
      priority: 'high',
    },
    {
      offsetDays: -1,
      phase: 'T-1 day',
      phaseTitle: 'Site Walkthrough',
      title: 'Perimeter Barrier & Sound Limiter Test',
      description: 'Inspect emergency egress corridors, fire extinguishers, ADA wheelchair ramps, and 85dB sound limiters.',
      priority: 'high',
    },
  ],
};

/**
 * Auto-generates a structured task schedule based on the event date (T-90, T-60, T-30, T-7 days).
 */
export function generateAutoScheduleMilestones(
  eventDate: string,
  domain: 'wedding' | 'birthday' | 'community'
): MacroMilestone[] {
  const templates = DOMAIN_MILESTONE_TEMPLATES[domain] || DOMAIN_MILESTONE_TEMPLATES.wedding;
  return templates.map((tmpl, idx) => ({
    id: `auto_milestone_${domain}_${tmpl.offsetDays}_${idx}`,
    phase: tmpl.phase,
    phaseTitle: tmpl.phaseTitle,
    title: tmpl.title,
    description: tmpl.description,
    dueDate: calculateMilestoneDate(eventDate, tmpl.offsetDays),
    isCompleted: false,
    priority: tmpl.priority,
  }));
}


