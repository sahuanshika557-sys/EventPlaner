import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

const mockEventContext = {
  id: 'evt-test-1',
  domain: 'wedding' as const,
  title: 'Royal Rajputana Wedding',
  date: '2026-12-15',
  totalBudget: 60000,
  currency: 'USD',
  guestCount: 250,
  budgetItems: [
    { name: 'Palace Venue', category: 'Venue', actualCost: 25000, estimatedCost: 25000, isPaid: true },
    { name: 'Catering & Bar', category: 'Catering', actualCost: 12000, estimatedCost: 18000, isPaid: false },
  ],
  vendors: [
    { name: 'The Leela Palace', category: 'Venue', status: 'paid', contractAmount: 25000, balanceDue: 0 },
    { name: 'Royal Feast Catering', category: 'Catering', status: 'confirmed', contractAmount: 18000, balanceDue: 6000 },
  ],
  macroMilestones: [
    { title: 'Book Venue', isCompleted: true, dueDate: '2026-09-15' },
    { title: 'Tasting & Finalize Menu', isCompleted: false, dueDate: '2026-10-15' },
  ],
};

describe('Server AI Proxy Integration & Security (Supertest)', () => {
  it('GET /api/health returns 200 with security config and zero secret leakage', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('UtsavOS Secure AI Proxy');
    expect(typeof res.body.hasGeminiKey).toBe('boolean');
    // Ensure the actual API key string is never leaked in response
    expect(JSON.stringify(res.body)).not.toContain('AIza');
  });

  it('POST /api/ai/generate returns 200 and structured event plan for valid payload', async () => {
    const res = await request(app)
      .post('/api/ai/generate')
      .send({
        eventType: 'wedding',
        theme: 'Royal Rajputana Heritage',
        guestCount: 250,
        totalBudget: 60000,
        culture: 'north_indian',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.themeTitle).toBeDefined();
    expect(res.body.data.menu).toBeDefined();
    expect(Array.isArray(res.body.data.menu.appetizers)).toBe(true);
    expect(Array.isArray(res.body.data.returnGifts)).toBe(true);
  });

  it('POST /api/ai/generate rejects invalid input with 400 Bad Request (Zod validation)', async () => {
    const res = await request(app)
      .post('/api/ai/generate')
      .send({
        eventType: 'invalid_type', // Invalid domain
        theme: '', // Empty theme
        guestCount: -5, // Negative guests
        totalBudget: -1000, // Negative budget
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid input parameters');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('POST /api/ai/chat returns contextual planning advice based on live event state', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        message: 'How do I cut 10% from my budget?',
        eventContext: mockEventContext,
      });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBeDefined();
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.reply.length).toBeGreaterThan(20);
  });

  it('POST /api/ai/chat rejects request missing eventContext with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        message: 'How do I cut 10% from my budget?',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid chat message payload');
  });
});
