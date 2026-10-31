import { describe, it, expect } from 'vitest';
import {
  parseTimeToMinutes,
  minutesTo12Hour,
  calculateEndTime,
  sortTimelineChronologically,
  detectTimelineConflicts,
} from '../utils/time';
import type { TimelineEntry } from '../types/timeline';

describe('Timeline Engine & Chronological Scheduling', () => {
  it('accurately parses mixed 12-hour AM/PM and 24-hour time formats into minutes from midnight', () => {
    expect(parseTimeToMinutes('12:00 AM')).toBe(0);
    expect(parseTimeToMinutes('08:30 AM')).toBe(510);
    expect(parseTimeToMinutes('12:00 PM')).toBe(720);
    expect(parseTimeToMinutes('01:15 PM')).toBe(795);
    expect(parseTimeToMinutes('11:59 PM')).toBe(1439);

    // 24-hour inputs
    expect(parseTimeToMinutes('08:30')).toBe(510);
    expect(parseTimeToMinutes('13:15')).toBe(795);
    expect(parseTimeToMinutes('23:59')).toBe(1439);
  });

  it('formats minutes from midnight back into clean 12-hour AM/PM format', () => {
    expect(minutesTo12Hour(0)).toBe('12:00 AM');
    expect(minutesTo12Hour(510)).toBe('08:30 AM');
    expect(minutesTo12Hour(720)).toBe('12:00 PM');
    expect(minutesTo12Hour(795)).toBe('01:15 PM');
  });

  it('calculates end time correctly based on start time and duration', () => {
    const end = calculateEndTime('09:30 AM', 45);
    expect(end).toBe('10:15 AM');

    const endOverNoon = calculateEndTime('11:45 AM', 30);
    expect(endOverNoon).toBe('12:15 PM');
  });

  it('sorts timeline entries chronologically even if entered out of order', () => {
    const unsorted: TimelineEntry[] = [
      {
        id: '3',
        time: '07:00 PM',
        durationMinutes: 60,
        title: 'Reception Gala',
        owner: 'MC',
        location: 'Ballroom',
        milestone: 'Dinner',
        status: 'scheduled',
      },
      {
        id: '1',
        time: '08:00 AM',
        durationMinutes: 90,
        title: 'Morning Prep',
        owner: 'Stylist',
        location: 'Suite',
        milestone: 'Prep',
        status: 'scheduled',
      },
      {
        id: '2',
        time: '01:30 PM',
        durationMinutes: 45,
        title: 'Afternoon Ceremony',
        owner: 'Officiant',
        location: 'Garden',
        milestone: 'Ceremony',
        status: 'scheduled',
      },
    ];

    const sorted = sortTimelineChronologically(unsorted);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
    expect(sorted[2].id).toBe('3');
  });

  it('detects schedule conflicts when two events overlap in the same location', () => {
    const overlappingEntries: TimelineEntry[] = [
      {
        id: 'e1',
        time: '10:00 AM',
        durationMinutes: 60, // 10:00 AM to 11:00 AM
        title: 'Mandap Floral Setup',
        owner: 'Florist Maya',
        location: 'Main Ballroom',
        milestone: 'Setup',
        status: 'scheduled',
      },
      {
        id: 'e2',
        time: '10:30 AM',
        durationMinutes: 45, // 10:30 AM to 11:15 AM - overlaps in Main Ballroom!
        title: 'Soundcheck & Mic Testing',
        owner: 'DJ Rohit',
        location: 'Main Ballroom',
        milestone: 'Audio',
        status: 'scheduled',
      },
    ];

    const conflicts = detectTimelineConflicts(overlappingEntries);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].conflictType).toBe('location');
    expect(conflicts[0].details).toContain('Main Ballroom');
  });

  it('detects double-booking when the same owner is scheduled for overlapping activities', () => {
    const doubleBooked: TimelineEntry[] = [
      {
        id: 'e1',
        time: '02:00 PM',
        durationMinutes: 60,
        title: 'Guest Greeting',
        owner: 'Captain Cosmic',
        location: 'Front Gate',
        milestone: 'Arrivals',
        status: 'scheduled',
      },
      {
        id: 'e2',
        time: '02:30 PM',
        durationMinutes: 30,
        title: 'Obstacle Course Host',
        owner: 'Captain Cosmic', // Same owner!
        location: 'Arena Turf',
        milestone: 'Games',
        status: 'scheduled',
      },
    ];

    const conflicts = detectTimelineConflicts(doubleBooked);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].conflictType).toBe('owner');
    expect(conflicts[0].details).toContain('Captain Cosmic');
  });
});
