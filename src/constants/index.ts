/**
 * Central constants registry for UtsavOS
 * Prevents magic strings and numbers across components, services, and hooks.
 */

import type { EventDomain } from '../types/event';
import type { MacroPhase } from '../types/timeline';

/**
 * LocalStorage keys for state persistence
 */
export const STORAGE_KEYS = {
  CURRENT_EVENT: 'utsavos_current_event_v1',
  EVENT_PREFIX: 'utsavos_event_data_v1_',
  THEME_PREFERENCE: 'utsavos_theme_preference',
  ACCESSIBILITY_HIGH_CONTRAST: 'utsavos_high_contrast',
  EVENT_ARCHIVE: 'utsavos_event_archive_v1',
} as const;

/**
 * Standard debounce and animation durations in milliseconds
 */
export const TIMING = {
  SEARCH_DEBOUNCE_MS: 300,
  AI_CALL_TIMEOUT_MS: 15000,
  TOAST_AUTO_DISMISS_MS: 4000,
  FAST_ANIMATION_MS: 200,
  NORMAL_ANIMATION_MS: 300,
} as const;

/**
 * Standard milestone countdown offsets backwards from the target event date
 */
export const MILESTONE_TARGET_OFFSETS: Record<MacroPhase, number> = {
  '-6 months': 180,
  '-2 months': 60,
  '-2 weeks': 14,
  '-1 day': 1,
  'T-90 days': 90,
  'T-60 days': 60,
  'T-30 days': 30,
  'T-7 days': 7,
  'T-1 day': 1,
};

/**
 * Default event budgets by domain
 */
export const DEFAULT_BUDGETS: Record<EventDomain, number> = {
  wedding: 50000,
  birthday: 5000,
  community: 15000,
};

/**
 * Default guest counts by domain
 */
export const DEFAULT_GUEST_COUNTS: Record<EventDomain, number> = {
  wedding: 250,
  birthday: 50,
  community: 500,
};

/**
 * Standard budget threshold limits
 */
export const BUDGET_THRESHOLDS = {
  WARNING_PERCENTAGE: 0.9, // 90%
  OVERBUDGET_PERCENTAGE: 1.0, // 100%
  RECOMMENDED_CONTINGENCY_PERCENT: 0.1, // 10%
} as const;

/**
 * Application branding & metadata
 */
export const APP_METADATA = {
  NAME: 'UtsavOS',
  TAGLINE: 'AI-Native Celebration Operating System',
  VERSION: '2.0.0',
  CHALLENGE: 'PromptWars Challenge 5: Celebration & Event Planner',
} as const;
