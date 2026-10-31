import { describe, it, expect, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage, removeFromStorage } from '../utils/storage';

describe('Versioned Storage Utility & Migration (storage.ts)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns default value when localStorage is empty', () => {
    const fallback = { foo: 'bar' };
    const result = loadFromStorage('test_key', fallback);
    expect(result).toEqual(fallback);
  });

  it('persists data in versioned envelope and successfully retrieves it', () => {
    const payload = { eventTitle: 'Royal Wedding', budget: 50000 };
    const saved = saveToStorage('event_1', payload);

    expect(saved).toBe(true);

    const raw = window.localStorage.getItem('utsavos_planora_v1_event_1');
    expect(raw).toBeDefined();
    const parsedRaw = JSON.parse(raw!);
    expect(parsedRaw.schemaVersion).toBe(1);
    expect(parsedRaw.savedAt).toBeDefined();
    expect(parsedRaw.data).toEqual(payload);

    const loaded = loadFromStorage('event_1', { eventTitle: '', budget: 0 });
    expect(loaded).toEqual(payload);
  });

  it('migrates legacy unversioned storage key to versioned envelope and cleans up legacy key', () => {
    const legacyPayload = { eventTitle: 'Old Legacy Birthday', guests: 80 };
    window.localStorage.setItem('utsavos_legacy_event', JSON.stringify(legacyPayload));

    const loaded = loadFromStorage('legacy_event', { eventTitle: '', guests: 0 });
    expect(loaded).toEqual(legacyPayload);

    // Legacy unversioned key must have been removed
    expect(window.localStorage.getItem('utsavos_legacy_event')).toBeNull();

    // Migrated versioned key must now exist
    const migratedRaw = window.localStorage.getItem('utsavos_planora_v1_legacy_event');
    expect(migratedRaw).not.toBeNull();
    const parsedMigrated = JSON.parse(migratedRaw!);
    expect(parsedMigrated.schemaVersion).toBe(1);
    expect(parsedMigrated.data).toEqual(legacyPayload);
  });

  it('safely handles corrupted JSON and returns default value without crashing', () => {
    window.localStorage.setItem('utsavos_planora_v1_corrupt', '{not valid json:');

    const result = loadFromStorage('corrupt', { safe: true });
    expect(result).toEqual({ safe: true });
  });

  it('sanitizes prototype pollution attempts in stored payloads', () => {
    const maliciousPayload = JSON.parse('{"validProp": "ok", "__proto__": {"polluted": true}}');
    saveToStorage('exploit', maliciousPayload);

    const loaded = loadFromStorage('exploit', { validProp: '' });
    expect(loaded.validProp).toBe('ok');
    // Prototype should not be polluted
    expect((Object.prototype as unknown as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('removes keys cleanly with removeFromStorage', () => {
    saveToStorage('delete_me', { temp: true });
    expect(window.localStorage.getItem('utsavos_planora_v1_delete_me')).not.toBeNull();

    removeFromStorage('delete_me');
    expect(window.localStorage.getItem('utsavos_planora_v1_delete_me')).toBeNull();
  });
});

