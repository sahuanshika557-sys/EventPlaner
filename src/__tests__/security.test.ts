import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeUrl, escapeHtml } from '../utils/sanitizer';
import { sanitizeObject, validateEmail, validatePhone } from '../utils/validators';

describe('Application Security & OWASP Standards', () => {
  it('strips dangerous <script> tags and active payloads from user input', () => {
    const maliciousPayload = '<script>alert("XSS Attack!")</script>Normal Event Note';
    const cleaned = sanitizeInput(maliciousPayload);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert(');
    expect(cleaned).toContain('Normal Event Note');
  });

  it('neutralizes inline event handler injection attacks (onerror, onload, onclick)', () => {
    const imagePayload = '<img src="x" onerror="alert(document.cookie)" />Celebration Cake';
    const cleaned = sanitizeInput(imagePayload);

    expect(cleaned).not.toContain('onerror');
    expect(cleaned).not.toContain('alert(document.cookie)');
    expect(cleaned).toContain('Celebration Cake');
  });

  it('rejects and strips javascript: pseudo-protocols in URLs', () => {
    const dangerousUrl1 = 'javascript:alert(1)';
    const dangerousUrl2 = 'JAVASCRIPT:void(0)';
    const safeUrl = 'https://example.com/contract.pdf';

    expect(sanitizeUrl(dangerousUrl1)).toBe('');
    expect(sanitizeUrl(dangerousUrl2)).toBe('');
    expect(sanitizeUrl(safeUrl)).toBe('https://example.com/contract.pdf');
  });

  it('escapes raw HTML entities accurately', () => {
    const unescaped = '<div class="test">"Tom & Jerry"</div>';
    const escaped = escapeHtml(unescaped);

    expect(escaped).toContain('&lt;div');
    expect(escaped).toContain('&gt;');
    expect(escaped).toContain('&amp;');
    expect(escaped).toContain('&quot;');
    expect(escaped).not.toContain('<div');
  });

  it('protects against prototype pollution by discarding __proto__, constructor, and prototype', () => {
    const pollutedPayload = JSON.parse(
      '{"title": "Gala", "__proto__": {"isAdmin": true}, "constructor": {"prototype": {"polluted": true}}}'
    );

    const clean = sanitizeObject(pollutedPayload);

    expect(clean.title).toBe('Gala');
    expect((clean as any).__proto__?.isAdmin).toBeUndefined();
    expect((clean as any).constructor?.prototype?.polluted).toBeUndefined();
    expect((Object.prototype as any).isAdmin).toBeUndefined();
    expect((Object.prototype as any).polluted).toBeUndefined();
  });

  it('strictly validates email addresses against invalid inputs', () => {
    expect(validateEmail('planner@example.com')).toBe(true);
    expect(validateEmail('jane.doe+test@sub.domain.org')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('javascript:alert(1)')).toBe(false);
  });

  it('validates telephone numbers accurately', () => {
    expect(validatePhone('+1 555-234-5678')).toBe(true);
    expect(validatePhone('+44 20 7946 0958')).toBe(true);
    expect(validatePhone('1234567890')).toBe(true);
    expect(validatePhone('123')).toBe(false); // too short
    expect(validatePhone('abc-def-ghij')).toBe(false);
  });
});
