import { sanitizeObject } from './validators';

const STORAGE_PREFIX = 'utsavos_planora_v1_';
const CURRENT_SCHEMA_VERSION = 1;

interface StorageEnvelope<T> {
  schemaVersion: number;
  savedAt: string;
  data: T;
}

/**
 * Loads and migrates versioned data from localStorage with full prototype pollution defense.
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultValue;
  }

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) {
      // Check legacy unversioned keys for migration
      const legacyRaw = window.localStorage.getItem(`utsavos_${key}`);
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          saveToStorage(key, parsedLegacy);
          window.localStorage.removeItem(`utsavos_${key}`);
          return sanitizeObject(parsedLegacy) as T;
        } catch {
          // Ignore legacy corrupted data
        }
      }
      return defaultValue;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return defaultValue;
    }

    // Check if stored in versioned envelope
    if ('schemaVersion' in parsed && 'data' in parsed) {
      const envelope = parsed as StorageEnvelope<T>;
      if (envelope.schemaVersion === CURRENT_SCHEMA_VERSION) {
        return (typeof envelope.data === 'object' && envelope.data !== null
          ? sanitizeObject(envelope.data as Record<string, unknown>)
          : envelope.data) as T;
      }
      // Future schema migration path can be dispatched here based on envelope.schemaVersion
    }

    // Protect against prototype pollution and return sanitized object
    return sanitizeObject(parsed) as T;
  } catch (error) {
    console.warn(`Failed to parse stored state for key "${key}". Resetting to fallback.`, error);
    return defaultValue;
  }
}

/**
 * Persists data inside a versioned envelope with sanitization.
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const sanitized =
      typeof value === 'object' && value !== null
        ? sanitizeObject(value as Record<string, unknown>)
        : value;

    const envelope: StorageEnvelope<T> = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      data: sanitized as T,
    };

    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(envelope));
    return true;
  } catch (error) {
    console.error(`Failed to serialize and persist state for key "${key}".`, error);
    return false;
  }
}

/**
 * Safely removes a key from localStorage.
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.warn(`Could not remove key "${key}" from localStorage.`, error);
  }
}
