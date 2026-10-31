import type { EventDomain, EventModel } from '../types/event';
import type { WeddingCulture } from '../types/wedding';

export interface AIGenerateParams {
  eventType: EventDomain;
  theme: string;
  guestCount: number;
  totalBudget?: number;
  culture?: WeddingCulture | string;
  preferences?: string;
  budgetTier?: string;
  venueEnvironment?: string;
}

export interface StructuredEventPlan {
  themeTitle: string;
  conceptOverview: string;
  colorPalette: Array<{ name: string; hex: string }>;
  decor: {
    centerpiece: string;
    entrance: string;
    tablescape: string;
    estimatedBudgetPercent: number;
  };
  menu: {
    welcomeDrinks: string[];
    appetizers: string[];
    mainCourse: string[];
    desserts: string[];
    dietaryAccommodations: string;
  };
  entertainment: Array<{
    title: string;
    format: string;
    description: string;
    durationMinutes: number;
  }>;
  returnGifts: Array<{
    itemName: string;
    description: string;
    recipientGroup: string;
    estimatedUnitCost: number;
  }>;
  budgetOptimizations: string[];
  provider: string;
}

export interface AIGenerateResult {
  success: boolean;
  isLiveAI: boolean;
  data: StructuredEventPlan;
  notice?: string;
}

export interface AIChatResult {
  success: boolean;
  isLiveAI: boolean;
  reply: string;
}

// In-memory cache for repeated generation params
const ideasCache = new Map<string, StructuredEventPlan>();

export function clearAICache(): void {
  ideasCache.clear();
}

function computeCacheKey(params: AIGenerateParams): string {
  return `${params.eventType}_${params.theme}_${params.guestCount}_${params.culture || ''}_${params.budgetTier || ''}`;
}

/**
 * Calls backend proxy to generate structured event ideas with Gemini LLM,
 * falling back gracefully to offline curated ideas if unreachable.
 */
export async function generateEventIdeas(
  params: AIGenerateParams,
  signal?: AbortSignal
): Promise<AIGenerateResult> {
  const cacheKey = computeCacheKey(params);
  if (ideasCache.has(cacheKey)) {
    return {
      success: true,
      isLiveAI: false,
      data: ideasCache.get(cacheKey)!,
      notice: 'Served from fast local cache',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: signal || controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const json = (await res.json()) as AIGenerateResult;
    if (json.data) {
      ideasCache.set(cacheKey, json.data);
      return json;
    }
    throw new Error('Malformed server response');
  } catch (err) {
    // Offline resilience: generate static high-quality curated plan
    const fallbackPlan = getOfflineCuratedPlan(params);
    ideasCache.set(cacheKey, fallbackPlan);
    return {
      success: true,
      isLiveAI: false,
      data: fallbackPlan,
      notice: 'Curated Cultural Intelligence Engine (Offline Fallback)',
    };
  }
}

/**
 * Calls backend conversational assistant endpoint with live event context.
 */
export async function askPlanningAssistant(
  message: string,
  event: EventModel,
  signal?: AbortSignal
): Promise<AIChatResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const payload = {
      message,
      eventContext: {
        id: event.id,
        domain: event.domain,
        title: event.title,
        date: event.date,
        totalBudget: event.totalBudget,
        currency: event.currency,
        guestCount: event.guestCount,
        budgetItems: event.budgetItems.map((b) => ({
          name: b.name,
          category: b.category,
          actualCost: b.actualCost,
          estimatedCost: b.estimatedCost,
          isPaid: b.isPaid,
        })),
        vendors: event.vendors.map((v) => ({
          name: v.name,
          category: v.category,
          status: v.status,
          contractAmount: v.contractAmount,
          balanceDue: v.balanceDue,
        })),
        macroMilestones: event.macroMilestones.map((m) => ({
          title: m.title,
          isCompleted: m.isCompleted,
          dueDate: m.dueDate,
        })),
      },
    };

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: signal || controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return (await res.json()) as AIChatResult;
  } catch (err) {
    // Client-side offline fallback assistant
    return {
      success: true,
      isLiveAI: false,
      reply: getClientOfflineAssistantReply(message, event),
    };
  }
}

// ---------------------------------------------------------------------------
// OFFLINE CURATED FALLBACK ENGINE
// ---------------------------------------------------------------------------
function getOfflineCuratedPlan(params: AIGenerateParams): StructuredEventPlan {
  if (params.eventType === 'wedding') {
    return {
      themeTitle: `${params.theme || 'Royal Mughal Splendor'} & Celestial Flora`,
      conceptOverview: `A breathtaking celebration for ${params.guestCount} guests inspired by palace courtyards, aromatic florals, and royal hospitality.`,
      colorPalette: [
        { name: 'Imperial Crimson', hex: '#E11D48' },
        { name: 'Antique Zari Gold', hex: '#D4AF37' },
        { name: 'Royal Emerald', hex: '#047857' },
        { name: 'Pearl Ivory', hex: '#FDFBF7' },
        { name: 'Midnight Navy', hex: '#0F172A' },
      ],
      decor: {
        centerpiece: 'Hand-hammered brass urns with white avalanche roses, marigold garlands, and floating scented tea lights.',
        entrance: 'Grand 16ft scalloped floral arch with laser-cut jaali lanterns and rose petal shower.',
        tablescape: 'Burgundy raw silk runners, crystal water goblets, and custom brass crest stationery.',
        estimatedBudgetPercent: 16,
      },
      menu: {
        welcomeDrinks: ['Royal Kesar Thandai Elixir', 'Sparkling Rose Hibiscus Soda', 'Fresh King Coconut Water'],
        appetizers: ['Smoked Paneer Tikka Carpaccio', 'Crispy Lotus Root in Tamarind Glaze', 'Mini Galouti Sliders'],
        mainCourse: ['24-Hour Slow Simmered Dal Makhani', 'Awadhi Vegetable Dum Biryani', 'Rosemary Naan Basket'],
        desserts: ['Pistachio Kulfi with Gold Leaf & Rabdi', 'Hot Gulab Jamun Flambé'],
        dietaryAccommodations: 'Dedicated Jain, Vegan, Gluten-Free, and Nut-Free counters with certified allergy stewards.',
      },
      entertainment: [
        { title: 'Grand Baraat Procession with Live Dhol & Brass Horns', format: 'Processional', description: 'Groom arrival with choreographed family flash mob and celebratory cold sparks.', durationMinutes: 60 },
        { title: 'Acoustic Sitar & Cello Fusion Symphony', format: 'Live Banquet Music', description: 'Intimate classical ragas modernized for cocktail and dinner reception.', durationMinutes: 90 },
      ],
      returnGifts: [
        { itemName: 'Handcrafted Brass Diya in Velvet Keepsake Box', description: 'Auspicious artisan brassware paired with pure beeswax tealights.', recipientGroup: 'All Families', estimatedUnitCost: 20 },
        { itemName: 'Single-Estate Kashmir Saffron & Organic Honey', description: 'Luxury culinary gift duo packaged in gold-embossed cylinders.', recipientGroup: 'VIP Elders', estimatedUnitCost: 35 },
      ],
      budgetOptimizations: [
        'Repurpose mandap/ceremony floral installations directly to the reception head table to save up to 15% on floristry.',
        'Choose seasonal regional flowers (marigold, jasmine, local garden roses) over imported hydrangeas.',
        'Negotiate beverage corkage with the venue rather than purchasing per-drink open bar tiers.',
      ],
      provider: 'UtsavOS Curated Heritage Engine (Offline Safe)',
    };
  }

  if (params.eventType === 'birthday') {
    return {
      themeTitle: `${params.theme || 'Galactic Neon Horizon'} Milestone Party`,
      conceptOverview: `An energetic, sensory-rich milestone celebration for ${params.guestCount} guests featuring immersive lighting, interactive games, and artisan treats.`,
      colorPalette: [
        { name: 'Neon Purple', hex: '#8B5CF6' },
        { name: 'Cyber Cyan', hex: '#06B6D4' },
        { name: 'Amber Glow', hex: '#F59E0B' },
        { name: 'Obsidian Black', hex: '#0B0F19' },
      ],
      decor: {
        centerpiece: 'Suspended helium chrome balloon clusters with cascading micro-fairy lights and memory photo cards.',
        entrance: 'Custom LED neon name crest with interactive 360-degree video booth.',
        tablescape: 'Matte black composite tableware with geometric holographic runners and illuminated glow cubes.',
        estimatedBudgetPercent: 14,
      },
      menu: {
        welcomeDrinks: ['Cosmic Blue Curacao Citrus Spritz', 'Dragonfruit Mint Sparkler', 'Smoked Lemonade Slush'],
        appetizers: ['Artisan Mini Brioche Sliders', 'Truffle Parmesan Fries in Bamboo Cones', 'Crispy Mac & Cheese Bombs'],
        mainCourse: ['Artisanal Woodfired Pizza Counter', 'Gourmet Taco Bar with Fresh Pico & Guacamole', 'Smoked BBQ Chicken Skewers'],
        desserts: ['3D Sculpted Fondant Milestone Cake', 'Liquid Nitrogen Ice Cream Sundae Bar'],
        dietaryAccommodations: 'Allergen-free dessert boxes individually prepared for dairy and nut sensitivity.',
      },
      entertainment: [
        { title: 'Interactive VR & Laser Tag Battle Arena', format: 'Game', description: 'Team agility obstacle course with real-time digital scoreboard.', durationMinutes: 45 },
        { title: 'Live DJ Dance Battle & Confetti Blast', format: 'Music & Dance', description: 'High-energy playlist with LED glow batons and confetti cannon finale.', durationMinutes: 60 },
      ],
      returnGifts: [
        { itemName: 'Custom Embroidered Themed Capes & Swag Bag', description: 'Personalized merchandise keepsake with guest initials.', recipientGroup: 'Kids & Teens', estimatedUnitCost: 12 },
        { itemName: 'Artisanal Macaron & Cold Brew Gift Tin', description: 'Six assorted macarons from local patisserie in embossed gold tin.', recipientGroup: 'Adults', estimatedUnitCost: 16 },
      ],
      budgetOptimizations: [
        'Host party between 2:00 PM and 5:00 PM to serve heavy hors d’oeuvres instead of a 3-course dinner.',
        'Bundle audio-visual gear and DJ through the venue package to secure a 15% discount.',
      ],
      provider: 'UtsavOS Curated Milestone Engine (Offline Safe)',
    };
  }

  // Community Event
  return {
    themeTitle: `${params.theme || 'Eco-Harvest'} Community Unity Fair`,
    conceptOverview: `A zero-waste, vibrant neighborhood gathering for ${params.guestCount} attendees focused on local culture, sustainable crafts, and harvest music.`,
    colorPalette: [
      { name: 'Eco Emerald', hex: '#10B981' },
      { name: 'Harvest Amber', hex: '#F59E0B' },
      { name: 'Sky Cerulean', hex: '#0284C7' },
      { name: 'Natural Clay', hex: '#D97706' },
    ],
    decor: {
      centerpiece: 'Living potted native herb planters that attendees can adopt to start home gardens.',
      entrance: 'Communal unity ribbon arch where attendees tie personal neighborhood aspirations.',
      tablescape: 'Compostable bamboo tableware, unbleached kraft signage, and clearly posted recycling maps.',
      estimatedBudgetPercent: 10,
    },
    menu: {
      welcomeDrinks: ['Pressed Orchard Apple Cider', 'Cold Brew Herbal Tea', 'Free Hydration Refill Stations'],
      appetizers: ['Farmers Market Crudite Cups with Roasted Garlic Hummus', 'Warm Pretzel Bites with Mustard'],
      mainCourse: ['Local Food Truck Alley with $3 Sample Passes', 'Giant Communal Paella & Vegetable Stew'],
      desserts: ['Berry Cobbler in Cornstarch Bowls', 'Fair-Trade Cinnamon Churros'],
      dietaryAccommodations: 'Certified allergen disclosure posted at every food truck; designated vegan & nut-free tables.',
    },
    entertainment: [
      { title: 'Giant 16-Foot Community Mosaic Art Wall', format: 'Art Installation', description: 'Every attendee paints a numbered tile to form a permanent neighborhood mural.', durationMinutes: 120 },
      { title: 'Acoustic Porchfest & Youth Symphony Stage', format: 'Live Music', description: 'Rotating 15-minute acoustic sets featuring neighborhood performers.', durationMinutes: 180 },
    ],
    returnGifts: [
      { itemName: 'Wildflower Seed Packets & Cotton Tote Bag', description: 'Regional pollinator seeds in biodegradable planting paper.', recipientGroup: 'All Families', estimatedUnitCost: 3.5 },
    ],
    budgetOptimizations: [
      'Partner with city parks department to waive stage fees in exchange for a certified zero-waste audit.',
      'Enlist student volunteers for event marshaling and setup in exchange for community service hours.',
    ],
    provider: 'UtsavOS Curated Civic Engine (Offline Safe)',
  };
}

function getClientOfflineAssistantReply(message: string, event: EventModel): string {
  const q = message.toLowerCase();
  const currency = event.currency;
  const totalSpent = event.budgetItems.reduce((acc, it) => acc + (it.actualCost || 0), 0);
  const remaining = Math.max(0, event.totalBudget - totalSpent);

  if (q.includes('cut') || q.includes('save') || q.includes('10%') || q.includes('reduce')) {
    const tenPercent = (event.totalBudget * 0.1).toFixed(0);
    return `### 💡 Cutting 10% (${currency} ${Number(tenPercent).toLocaleString()}) from "${event.title}"

Here is an actionable, high-impact reduction strategy based on your event data:

1. **Catering Strategy (Save ~${currency} ${(Number(tenPercent) * 0.5).toFixed(0)})**
   - For **${event.guestCount} guests**, transitioning from plated dining to dual-station gourmet grazing cuts waitstaff hours by 25%.
   - Streamline the bar to signature welcome drinks, regional wine, and craft beer rather than full open top-shelf.

2. **Decor & Lighting Repurposing (Save ~${currency} ${(Number(tenPercent) * 0.3).toFixed(0)})**
   - Repurpose ceremony floral entrance arches to the main stage / photobooth area for the reception.
   - Utilize ambient warm amber uplighting clusters instead of heavy suspended floral rigs.

3. **Vendor Contract Scope (Save ~${currency} ${(Number(tenPercent) * 0.2).toFixed(0)})**
   - You currently have **${event.vendors.length} vendors**. Consider capping photographer coverage to 8 key hours instead of 12 hours.

*Financial Snapshot:* Total Budget: **${currency} ${event.totalBudget.toLocaleString()}** | Spent: **${currency} ${totalSpent.toLocaleString()}** | Remaining: **${currency} ${remaining.toLocaleString()}**.`;
  }

  if (q.includes('vendor') || q.includes('caterer') || q.includes('photographer')) {
    return `### 🤝 Vendor Checklist Status for "${event.title}"

You have **${event.vendors.length} vendors** registered:
${event.vendors.map((v) => `- **${v.name}** (${v.category}) — Status: \`${v.status}\` | Balance: ${currency} ${v.balanceDue || 0}`).join('\n')}

**Recommendations:**
- Verify final headcount with caterers 14 days prior to **${event.date}**.
- Confirm delivery access windows and power requirements with venue management.`;
  }

  if (q.includes('timeline') || q.includes('schedule') || q.includes('milestone')) {
    const completed = event.macroMilestones.filter((m) => m.isCompleted).length;
    return `### ⏱️ Timeline Health for "${event.title}"

- **Checkpoints Completed:** ${completed} of ${event.macroMilestones.length} milestones signed off.
- **Target Event Date:** ${event.date}

**Next Checkpoints:**
${event.macroMilestones
        .filter((m) => !m.isCompleted)
        .slice(0, 3)
        .map((m) => `- ⏳ **${m.title}** (Target: ${m.dueDate})`)
        .join('\n')}

*Tip:* Click **"⚡ Auto-Generate Schedule (T-90, T-60, T-30, T-7)"** in the Timeline tab to automatically populate key checkpoints calculated backwards from your date.`;
  }

  return `### 📋 Planning Assistant for "${event.title}"

Based on your current event state:
- **Date:** ${event.date} (${event.guestCount} guests expected)
- **Budget Health:** ${currency} ${totalSpent.toLocaleString()} spent of ${currency} ${event.totalBudget.toLocaleString()} (${remaining > 0 ? `${currency} ${remaining.toLocaleString()} remaining` : 'Over-budget alert!'})
- **Vendor Pipeline:** ${event.vendors.length} vendors engaged.

Try asking:
- *"How do I cut 10% from my budget?"*
- *"Review my vendor status and payment balances"*
- *"What should my next 3 timeline milestones be?"*`;
}

