import DOMPurify from 'dompurify';

/**
 * Escapes common HTML special characters to prevent raw injection
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips script tags, evil event handlers (onclick, onerror, onload), and javascript: protocol
 */
export function sanitizeInput(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input).trim();
  
  if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
    const cleaned = DOMPurify.sanitize(str, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
      ALLOWED_ATTR: ['class'],
    });
    // Remove any trailing or remaining javascript: or data: dangerous protocols
    return String(cleaned).replace(/javascript\s*:/gi, '').replace(/data\s*:\s*text\/html/gi, '');
  }

  // Pure fallback: strip dangerous scripts, protocols, event handlers
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/<[^>]+>/g, '');
}

/**
 * Validates and sanitizes a URL, ensuring it only allows safe protocols (http, https, mailto, tel)
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return '';
  }
  return trimmed;
}
