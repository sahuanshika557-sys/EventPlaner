import { sanitizeInput } from './sanitizer';

/**
 * Validates numeric inputs ensuring non-negative, finite numbers.
 * Throws or returns an error string if invalid.
 */
export function validateNonNegativeNumber(value: unknown, fieldName: string): { valid: boolean; value: number; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, value: 0, error: `${fieldName} is required.` };
  }

  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, value: 0, error: `${fieldName} must be a valid number.` };
  }

  if (num < 0) {
    return { valid: false, value: 0, error: `${fieldName} cannot be negative.` };
  }

  if (num > 100_000_000) {
    return { valid: false, value: 0, error: `${fieldName} exceeds maximum allowable ceiling ($100M).` };
  }

  return { valid: true, value: num };
}

/**
 * Validates integer guest counts >= 0
 */
export function validateGuestCount(value: unknown): { valid: boolean; value: number; error?: string } {
  const result = validateNonNegativeNumber(value, 'Guest count');
  if (!result.valid) return result;

  const intVal = Math.floor(result.value);
  return { valid: true, value: intVal };
}

/**
 * Strict email validation using OWASP compliant standard email regex
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Phone number validation (international or standard)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Allows optional +, digits, spaces, parentheses, hyphens, min 7 digits
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Protects objects against prototype pollution by discarding __proto__, constructor, and prototype keys
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const clean = Object.create(null) as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      clean[key] = sanitizeObject(val as Record<string, unknown>);
    } else if (typeof val === 'string') {
      clean[key] = sanitizeInput(val);
    } else {
      clean[key] = val;
    }
  }

  return clean as T;
}
