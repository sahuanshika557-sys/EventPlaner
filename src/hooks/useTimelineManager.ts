import { useMemo, useCallback } from 'react';
import type { MacroMilestone, TimelineEntry, ScheduleConflict, RunOfShowStatus } from '../types/timeline';
import {
  sortTimelineChronologically,
  detectTimelineConflicts,
  calculateEndTime,
  generateAutoScheduleMilestones,
} from '../utils/time';

interface UseTimelineManagerProps {
  macroMilestones: MacroMilestone[];
  runOfShow: TimelineEntry[];
  eventDate?: string;
  domain?: 'wedding' | 'birthday' | 'community';
  onUpdateMilestones?: (milestones: MacroMilestone[]) => void;
  onUpdateRunOfShow?: (entries: TimelineEntry[]) => void;
}

export function useTimelineManager({
  macroMilestones,
  runOfShow,
  eventDate,
  domain,
  onUpdateMilestones,
  onUpdateRunOfShow,
}: UseTimelineManagerProps) {
  // Chronologically sorted entries
  const sortedRunOfShow = useMemo(() => {
    return sortTimelineChronologically(runOfShow);
  }, [runOfShow]);

  // Detected conflicts & overlap alerts
  const conflicts: ScheduleConflict[] = useMemo(() => {
    return detectTimelineConflicts(runOfShow);
  }, [runOfShow]);

  // Milestone completion stats
  const macroStats = useMemo(() => {
    const total = macroMilestones.length;
    const completed = macroMilestones.filter((m) => m.isCompleted).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [macroMilestones]);

  // Macro milestone actions
  const toggleMilestone = useCallback(
    (id: string) => {
      const updated = macroMilestones.map((m) =>
        m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
      );
      if (onUpdateMilestones) {
        onUpdateMilestones(updated);
      }
    },
    [macroMilestones, onUpdateMilestones]
  );

  const addMilestone = useCallback(
    (newM: Omit<MacroMilestone, 'id' | 'isCompleted'>) => {
      const created: MacroMilestone = {
        ...newM,
        id: `macro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        isCompleted: false,
      };
      if (onUpdateMilestones) {
        onUpdateMilestones([...macroMilestones, created]);
      }
    },
    [macroMilestones, onUpdateMilestones]
  );

  const deleteMilestone = useCallback(
    (id: string) => {
      if (onUpdateMilestones) {
        onUpdateMilestones(macroMilestones.filter((m) => m.id !== id));
      }
    },
    [macroMilestones, onUpdateMilestones]
  );

  // Micro run-of-show actions
  const addRunOfShowEntry = useCallback(
    (entry: Omit<TimelineEntry, 'id'>) => {
      const duration = Math.max(5, entry.durationMinutes || 30);
      const calculatedEnd = calculateEndTime(entry.time, duration);
      const newEntry: TimelineEntry = {
        ...entry,
        id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        durationMinutes: duration,
        endTime: entry.endTime || calculatedEnd,
      };

      if (onUpdateRunOfShow) {
        onUpdateRunOfShow([...runOfShow, newEntry]);
      }
    },
    [runOfShow, onUpdateRunOfShow]
  );

  const updateRunOfShowEntry = useCallback(
    (id: string, updates: Partial<TimelineEntry>) => {
      const updated = runOfShow.map((it) => {
        if (it.id !== id) return it;
        const merged = { ...it, ...updates };
        if (updates.time || updates.durationMinutes) {
          merged.endTime = calculateEndTime(merged.time, merged.durationMinutes);
        }
        return merged;
      });

      if (onUpdateRunOfShow) {
        onUpdateRunOfShow(updated);
      }
    },
    [runOfShow, onUpdateRunOfShow]
  );

  const deleteRunOfShowEntry = useCallback(
    (id: string) => {
      if (onUpdateRunOfShow) {
        onUpdateRunOfShow(runOfShow.filter((it) => it.id !== id));
      }
    },
    [runOfShow, onUpdateRunOfShow]
  );

  const setRunOfShowStatus = useCallback(
    (id: string, status: RunOfShowStatus) => {
      const updated = runOfShow.map((it) => (it.id === id ? { ...it, status } : it));
      if (onUpdateRunOfShow) {
        onUpdateRunOfShow(updated);
      }
    },
    [runOfShow, onUpdateRunOfShow]
  );

  const generateAutoSchedule = useCallback(
    (targetDate?: string, targetDomain?: 'wedding' | 'birthday' | 'community') => {
      const dateToUse = targetDate || eventDate || new Date().toISOString().split('T')[0];
      const domainToUse = targetDomain || domain || 'wedding';
      const autoMilestones = generateAutoScheduleMilestones(dateToUse, domainToUse);
      if (onUpdateMilestones) {
        onUpdateMilestones(autoMilestones);
      }
      return autoMilestones;
    },
    [eventDate, domain, onUpdateMilestones]
  );

  return {
    sortedRunOfShow,
    conflicts,
    macroStats,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    generateAutoSchedule,
    addRunOfShowEntry,
    updateRunOfShowEntry,
    deleteRunOfShowEntry,
    setRunOfShowStatus,
  };
}
