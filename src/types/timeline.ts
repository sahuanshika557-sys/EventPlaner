export type MacroPhase =
  | '-6 months'
  | '-2 months'
  | '-2 weeks'
  | '-1 day'
  | 'T-90 days'
  | 'T-60 days'
  | 'T-30 days'
  | 'T-7 days'
  | 'T-1 day';

export interface MacroMilestone {
  id: string;
  phase: MacroPhase;
  phaseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

export type RunOfShowStatus = 'scheduled' | 'in-progress' | 'completed' | 'delayed';

export interface TimelineEntry {
  id: string;
  time: string; // "09:00", "09:00 AM", "14:30", "02:30 PM"
  durationMinutes: number;
  endTime?: string;
  title: string;
  owner: string;
  location: string;
  milestone: string;
  status: RunOfShowStatus;
  notes?: string;
}

export interface ScheduleConflict {
  entryId1: string;
  entryId2: string;
  title1: string;
  title2: string;
  time1: string;
  time2: string;
  conflictType: 'location' | 'owner' | 'overlap';
  details: string;
}
