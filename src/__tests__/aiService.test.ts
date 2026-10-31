import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEventIdeas, askPlanningAssistant, clearAICache } from '../services/aiService';
import { INITIAL_WEDDING_EVENT } from '../data/defaultEvents';

describe('AI Service Client (Robustness, Caching & Fallback)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearAICache();
  });

  it('successfully returns structured plan from API', async () => {
    const mockApiResponse = {
      themeTitle: 'Royal Rajputana Splendor',
      conceptOverview: 'A grand celebration with royal palace aesthetics.',
      colorPalette: [
        { name: 'Royal Crimson', hex: '#E11D48' },
        { name: 'Zari Gold', hex: '#D4AF37' },
      ],
      decor: {
        centerpiece: 'Brass urlis with floating lotuses',
        entrance: 'Floral arches with marigolds',
        tablescape: 'Silk brocade runners',
        estimatedBudgetPercent: 15,
      },
      menu: {
        welcomeDrinks: ['Kesar Pista Milk', 'Rose Sherbet'],
        appetizers: ['Paneer Tikka', 'Dahi Vada'],
        mainCourse: ['Dal Makhani', 'Shahi Paneer', 'Naan'],
        desserts: ['Gulab Jamun', 'Rasmalai'],
        dietaryAccommodations: 'Pure vegetarian and Jain options available.',
      },
      entertainment: [
        {
          title: 'Rajasthani Folk Troupe',
          format: 'Live Acoustic',
          description: 'Ghoomar and Kalbelia dancers',
          durationMinutes: 60,
        },
      ],
      returnGifts: [
        {
          itemName: 'Artisanal Brass Diya Box',
          recipientGroup: 'Families',
          estimatedUnitCost: 20,
          description: 'Handcrafted diya with organic soy wax.',
        },
      ],
      budgetOptimizations: ['Opt for in-season marigolds to cut floral expenses by 20%.'],
      provider: 'Gemini 1.5 Flash',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        isLiveAI: true,
        data: mockApiResponse,
      }),
    });

    const result = await generateEventIdeas({
      eventType: 'wedding',
      theme: 'Royal Palace',
      guestCount: 200,
      totalBudget: 50000,
    });

    expect(result.data).toBeDefined();
    expect(result.data?.themeTitle).toBe('Royal Rajputana Splendor');
    expect(result.isLiveAI).toBe(true);
  });

  it('gracefully falls back to curated offline presets when API fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

    const result = await generateEventIdeas({
      eventType: 'wedding',
      theme: 'Heritage Elegance',
      guestCount: 150,
      totalBudget: 40000,
    });

    expect(result.data).toBeDefined();
    expect(result.isLiveAI).toBe(false);
    expect(result.data?.menu.appetizers.length).toBeGreaterThan(0);
    expect(result.data?.returnGifts.length).toBeGreaterThan(0);
  });

  it('serves cached responses for identical query inputs', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        isLiveAI: true,
        data: {
          themeTitle: 'Cached Splendor',
          conceptOverview: 'Overview',
          colorPalette: [],
          decor: { centerpiece: '', entrance: '', tablescape: '', estimatedBudgetPercent: 10 },
          menu: { welcomeDrinks: [], appetizers: [], mainCourse: [], desserts: [], dietaryAccommodations: '' },
          entertainment: [],
          returnGifts: [],
          budgetOptimizations: [],
          provider: 'Gemini 1.5 Flash',
        },
      }),
    });
    globalThis.fetch = mockFetch;

    const params = {
      eventType: 'birthday' as const,
      theme: 'Superhero Gala',
      guestCount: 50,
    };

    const first = await generateEventIdeas(params);
    const second = await generateEventIdeas(params);

    expect(first.data?.themeTitle).toBe('Cached Splendor');
    expect(second.data?.themeTitle).toBe('Cached Splendor');
    // Fetch should only be invoked ONCE due to SHA-style input hash caching
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(second.isLiveAI).toBe(false);
  });

  it('Planning Assistant provides intelligent budget answers offline or on API failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Server unavailable'));

    const response = await askPlanningAssistant('How do I cut 10% from my budget?', INITIAL_WEDDING_EVENT);

    expect(response).toBeDefined();
    expect(typeof response.reply).toBe('string');
    expect(response.reply.toLowerCase()).toContain('budget');
  });
});
