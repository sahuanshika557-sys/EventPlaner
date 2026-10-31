import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// 1. SECURITY & MIDDLEWARE
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by frontend meta tags
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));

// Global Rate Limiting: max 120 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
});

// Stricter rate limit on AI generation: max 30 per 5 minutes
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI generation limit reached. Please wait a moment before trying again.' },
});

app.use('/api/', apiLimiter);

// ---------------------------------------------------------------------------
// 2. INPUT VALIDATION SCHEMAS (ZOD)
// ---------------------------------------------------------------------------
const AIGenerateSchema = z.object({
  eventType: z.enum(['wedding', 'birthday', 'community']),
  theme: z.string().min(1).max(200),
  guestCount: z.number().int().min(1).max(100000),
  totalBudget: z.number().min(0).max(100000000).optional(),
  culture: z.string().max(100).optional(),
  preferences: z.string().max(1000).optional(),
  budgetTier: z.string().max(100).optional(),
  venueEnvironment: z.string().max(100).optional(),
});

const AIChatSchema = z.object({
  message: z.string().min(1).max(2000),
  eventContext: z.object({
    id: z.string(),
    domain: z.enum(['wedding', 'birthday', 'community']),
    title: z.string(),
    date: z.string(),
    totalBudget: z.number().min(0),
    currency: z.string(),
    guestCount: z.number().min(0),
    budgetItems: z.array(
      z.object({
        name: z.string(),
        category: z.string(),
        actualCost: z.number().optional(),
        estimatedCost: z.number().optional(),
        isPaid: z.boolean().optional(),
      })
    ),
    vendors: z.array(
      z.object({
        name: z.string(),
        category: z.string(),
        status: z.string(),
        contractAmount: z.number().optional(),
        balanceDue: z.number().optional(),
      })
    ),
    macroMilestones: z.array(
      z.object({
        title: z.string(),
        isCompleted: z.boolean(),
        dueDate: z.string(),
      })
    ),
  }),
});

// ---------------------------------------------------------------------------
// 3. GEMINI API CALLER WITH RETRY & TIMEOUT
// ---------------------------------------------------------------------------
async function callGeminiAPI(systemInstruction: string, promptText: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null; // Triggers curated fallback
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUSER PROMPT:\n${promptText}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}`);
      return null;
    }

    interface GeminiResponse {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    }

    const data = (await response.json()) as GeminiResponse;
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Gemini API call failed, falling back to curated engine:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 4. API ENDPOINTS
// ---------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'UtsavOS Secure AI Proxy',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
  });
});

// AI Idea Generation: Returns structured JSON (themes, menu, decor, entertainment, return gifts, budget tips)
app.post('/api/ai/generate', aiLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = AIGenerateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input parameters', details: parsed.error.issues });
      return;
    }

    const params = parsed.data;

    const systemInstruction = `You are UtsavOS GenAI, an elite event planning AI with deep cultural intelligence.
Generate a comprehensive, tailored event plan for a ${params.eventType}.
Return STRICT JSON adhering to this schema:
{
  "themeTitle": string,
  "conceptOverview": string,
  "colorPalette": [ { "name": string, "hex": string } ],
  "decor": {
    "centerpiece": string,
    "entrance": string,
    "tablescape": string,
    "estimatedBudgetPercent": number
  },
  "menu": {
    "welcomeDrinks": [string],
    "appetizers": [string],
    "mainCourse": [string],
    "desserts": [string],
    "dietaryAccommodations": string
  },
  "entertainment": [
    { "title": string, "format": string, "description": string, "durationMinutes": number }
  ],
  "returnGifts": [
    { "itemName": string, "description": string, "recipientGroup": string, "estimatedUnitCost": number }
  ],
  "budgetOptimizations": [string],
  "provider": "Gemini 1.5 Flash"
}`;

    const promptText = `Event Type: ${params.eventType}
Theme/Vision: ${params.theme}
Guest Count: ${params.guestCount}
Total Budget: ${params.totalBudget ? `$${params.totalBudget}` : 'Flexible'}
Culture/Tradition: ${params.culture || 'General'}
Preferences: ${params.preferences || 'Modern Elegance & High Guest Engagement'}
Budget Tier: ${params.budgetTier || 'Balanced'}
Venue Environment: ${params.venueEnvironment || 'Indoor / Outdoor Pavilion'}`;

    const rawLlmResponse = await callGeminiAPI(systemInstruction, promptText);

    if (rawLlmResponse) {
      try {
        const parsedJson = JSON.parse(rawLlmResponse);
        res.json({ success: true, isLiveAI: true, data: parsedJson });
        return;
      } catch {
        console.warn('Could not parse Gemini JSON response, serving curated fallback');
      }
    }

    // Curated High-Quality Fallback
    const fallbackIdeas = generateCuratedIdeas(params);
    res.json({
      success: true,
      isLiveAI: false,
      data: fallbackIdeas,
      notice: 'Served via Curated Cultural Intelligence Engine (Offline Fallback)',
    });
  } catch {
    res.status(500).json({ error: 'Internal server error processing event ideas' });
  }
});

// AI Conversational Planning Assistant Chat: Answers specific questions using event data as context
app.post('/api/ai/chat', aiLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = AIChatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid chat message payload', details: parsed.error.issues });
      return;
    }

    const { message, eventContext } = parsed.data;

    // Derived statistics from event context for the system prompt
    const totalSpent = eventContext.budgetItems.reduce((acc, it) => acc + (it.actualCost || 0), 0);
    const remaining = Math.max(0, eventContext.totalBudget - totalSpent);
    const percentSpent = eventContext.totalBudget > 0 ? Math.round((totalSpent / eventContext.totalBudget) * 100) : 0;
    const completedMilestones = eventContext.macroMilestones.filter((m) => m.isCompleted).length;
    const totalMilestones = eventContext.macroMilestones.length;

    const systemInstruction = `You are the UtsavOS Planning Assistant, an expert, encouraging event director.
You are helping the user plan their "${eventContext.title}" (${eventContext.domain}).
EVENT LIVE CONTEXT:
- Date: ${eventContext.date}
- Guests: ${eventContext.guestCount}
- Total Budget: ${eventContext.currency} ${eventContext.totalBudget.toLocaleString()}
- Total Spent: ${eventContext.currency} ${totalSpent.toLocaleString()} (${percentSpent}% utilized)
- Remaining Budget: ${eventContext.currency} ${remaining.toLocaleString()}
- Vendors Engaged: ${eventContext.vendors.length} vendors (${eventContext.vendors.map((v) => `${v.name} [${v.category}: ${v.status}]`).join(', ')})
- Key Budget Expenses: ${eventContext.budgetItems.map((b) => `${b.name} (${b.category}): ${eventContext.currency} ${b.actualCost || 0}`).join('; ')}
- Timeline Milestones: ${completedMilestones}/${totalMilestones} completed (${eventContext.macroMilestones.map((m) => `${m.title} [${m.isCompleted ? 'DONE' : 'PENDING'}]`).join(', ')})

GUIDELINES:
1. Always reference the user's specific event numbers, vendors, and line items.
2. If asked "How do I cut 10% from my budget?", calculate the exact 10% figure (${eventContext.currency} ${(eventContext.totalBudget * 0.1).toFixed(0)}) and identify specific categories with concrete cost-saving suggestions (e.g., renegotiating catering service styles, optimizing bar packages, reducing printed stationery, or hiring local talent).
3. Keep answers concise, actionable, bulleted, and professional.
4. Output clean markdown format.`;

    const rawLlmResponse = await callGeminiAPI(systemInstruction, message);

    if (rawLlmResponse) {
      res.json({
        success: true,
        isLiveAI: true,
        reply: rawLlmResponse,
      });
      return;
    }

    // Rule-Based Contextual Chat Assistant Fallback
    const ruleBasedReply = generateRuleBasedAssistantReply(message, eventContext, totalSpent, remaining);
    res.json({
      success: true,
      isLiveAI: false,
      reply: ruleBasedReply,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error processing assistant chat' });
  }
});

// Generic safe error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'An unexpected internal error occurred. Please try again.',
  });
});

// ---------------------------------------------------------------------------
// 5. CURATED STATIC FALLBACK GENERATORS (OFFLINE RESILIENCE)
// ---------------------------------------------------------------------------
function generateCuratedIdeas(params: z.infer<typeof AIGenerateSchema>) {
  if (params.eventType === 'wedding') {
    return {
      themeTitle: `${params.theme} Royal Heritage & Floral Elegance`,
      conceptOverview: `An opulent celebration designed for ${params.guestCount} guests blending royal cultural motifs with contemporary luxury styling.`,
      colorPalette: [
        { name: 'Imperial Crimson', hex: '#E11D48' },
        { name: 'Antique Zari Gold', hex: '#D4AF37' },
        { name: 'Royal Emerald', hex: '#047857' },
        { name: 'Pearl Ivory', hex: '#FDFBF7' },
        { name: 'Midnight Navy', hex: '#0F172A' },
      ],
      decor: {
        centerpiece: 'Cascading white avalanche roses and brass urlis with floating candles and gold leaf accents.',
        entrance: 'Grand floral archway with geometric jaali panels, acoustic shehnai soundscape, and rose petal shower.',
        tablescape: 'Embroidered silk runners, crystal water goblets, personalized brass name card holders.',
        estimatedBudgetPercent: 16,
      },
      menu: {
        welcomeDrinks: ['Saffron Cardamom Thandai Mocktail', 'Pomegranate Rosemary Sparkler', 'Fresh Coconut Elixir'],
        appetizers: ['Paneer Tikka Mille-Feuille', 'Truffle Galouti Sliders', 'Crispy Lotus Stem in Plum Glaze'],
        mainCourse: ['Royal Dal Makhani Slow-Simmered for 24 Hrs', 'Dum Biryani with Mint Raita', 'Artisanal Naan Basket'],
        desserts: ['Pistachio Kulfi with Rose Petal Rabdi', 'Warm Jalebi Caviar with Saffron Cream'],
        dietaryAccommodations: 'Full Jain, Vegan, Gluten-Free, and Halal counters clearly demarcated with live culinary stewards.',
      },
      entertainment: [
        { title: 'Grand Baraat Procession with Live Brass Band & Dhol', format: 'Processional Music', description: 'Energetic traditional arrival featuring customized family dance flash mobs.', durationMinutes: 60 },
        { title: 'Acoustic Sitar & Cello Fusion Ensemble', format: 'Dinner Music', description: 'Intimate classical melodies blended with modern love ballads during banquet service.', durationMinutes: 90 },
      ],
      returnGifts: [
        { itemName: 'Handcrafted Brass Ganesha / Diya in Velvet Box', description: 'Auspicious keepsake hand-poured by traditional artisans.', recipientGroup: 'All Families', estimatedUnitCost: 22 },
        { itemName: 'Artisanal Organic Tea & Exotic Honey Duo', description: 'Assam orthodox black tea and Kashmir saffron acacia honey.', recipientGroup: 'VIP Guests', estimatedUnitCost: 35 },
      ],
      budgetOptimizations: [
        'Repurpose ceremony floral arrangements to the reception stage to save 12-15% on floristry.',
        'Opt for a multi-tiered faux display cake with premium sheet cakes served from kitchen to cut bakery costs by 30%.',
        'Book local acoustic ensembles instead of large 10-piece touring bands to optimize sound and equipment riders.',
      ],
      provider: 'UtsavOS Curated Heritage Engine (Offline Safe)',
    };
  }

  if (params.eventType === 'birthday') {
    return {
      themeTitle: `${params.theme} Milestone Celebration Experience`,
      conceptOverview: `A high-energy, memorable milestone party designed for ${params.guestCount} guests packed with interactive zones and custom desserts.`,
      colorPalette: [
        { name: 'Neon Violet', hex: '#8B5CF6' },
        { name: 'Electric Cyan', hex: '#06B6D4' },
        { name: 'Sunset Amber', hex: '#F59E0B' },
        { name: 'Deep Space Navy', hex: '#0B0F19' },
      ],
      decor: {
        centerpiece: 'Floating helium balloon clusters with LED micro-fairy lights and polaroid memory photo clips.',
        entrance: 'Custom LED neon sign with celebrant name and 360-degree glitz photobooth backdrop.',
        tablescape: 'Biodegradable matte black plates, holographic confetti, and illuminated acrylic menu cubes.',
        estimatedBudgetPercent: 14,
      },
      menu: {
        welcomeDrinks: ['Cosmic Blue Curacao Citrus Fizz', 'Berry Basil Sparkler', 'Smoked Lemonade Slush'],
        appetizers: ['Gourmet Slider Trio (Angus, Chicken, Portobello)', 'Truffle Parmesan Fries Cones', 'Crispy Mac & Cheese Bites'],
        mainCourse: ['Woodfired Neapolitan Pizza Bar', 'Custom Street Taco Station with Fresh Guacamole', 'Grilled Mediterranean Skewers'],
        desserts: ['3D Fondant Sculpted Milestone Cake', 'Liquid Nitrogen Ice Cream Tasting Bar'],
        dietaryAccommodations: 'Nut-free, dairy-free, and vegan dessert alternatives pre-packaged for safety.',
      },
      entertainment: [
        { title: 'Interactive VR & Laser Tag Agility Battle', format: 'Active Game', description: 'Team challenges with live scoreboard displayed on central screens.', durationMinutes: 45 },
        { title: 'DJ Glow Party & Confetti Finale', format: 'Dance', description: 'High-energy playlist, LED wristbands synchronized to beat, and cold-spark sendoff.', durationMinutes: 60 },
      ],
      returnGifts: [
        { itemName: 'Custom Embroidered Satin Party Capes & Goodie Box', description: 'Themed merchandise personalized with guest initials.', recipientGroup: 'Kids & Teens', estimatedUnitCost: 12 },
        { itemName: 'Gourmet Artisanal Popcorn & Macaron Flight', description: 'Luxury sweet treat assortment in stamped gold tins.', recipientGroup: 'Adults', estimatedUnitCost: 15 },
      ],
      budgetOptimizations: [
        'Host during late afternoon (2 PM - 5 PM) for heavy hors d’oeuvres instead of a formal sit-down 3-course dinner.',
        'Bundle venue and audiovisual equipment with the same vendor to negotiate a 15% package discount.',
      ],
      provider: 'UtsavOS Curated Milestone Engine (Offline Safe)',
    };
  }

  // Community Event
  return {
    themeTitle: `${params.theme} Neighborhood Unity Festival`,
    conceptOverview: `An inclusive, accessible outdoor civic fair for ${params.guestCount} attendees emphasizing sustainability and local culture.`,
    colorPalette: [
      { name: 'Eco Emerald', hex: '#10B981' },
      { name: 'Civic Gold', hex: '#F59E0B' },
      { name: 'Sky Cerulean', hex: '#0284C7' },
      { name: 'Natural Kraft', hex: '#D97706' },
    ],
    decor: {
      centerpiece: 'Living potted native herb planters that community members can adopt at the close of festival.',
      entrance: 'Communal fabric ribbon gateway where attendees tie their personal neighborhood wish.',
      tablescape: 'Recycled canvas banners, compostable bamboo tableware, and clearly labeled hydration station maps.',
      estimatedBudgetPercent: 10,
    },
    menu: {
      welcomeDrinks: ['Locally Pressed Apple Cider', 'Cold Brew Iced Tea', 'Water Refill Stations'],
      appetizers: ['Local Farmhouse Crudité Cups with Hummus', 'Mini Soft Pretzels with Beer Mustard'],
      mainCourse: ['Family-Owned Food Truck Alley (Rotational sample plates)', 'Community Paella & Harvest Stew'],
      desserts: ['Fresh Berry Cobbler in Compostable Bowls', 'Churros with Fair-Trade Chocolate Dip'],
      dietaryAccommodations: 'All food trucks submit certified ingredient sheets for allergens; dedicated vegan & gluten-free zones.',
    },
    entertainment: [
      { title: 'Collaborative Giant Neighborhood Mosaic Mural', format: 'Co-Creation Art', description: 'Community members paint a numbered wood tile; installed at community hall.', durationMinutes: 120 },
      { title: 'Acoustic Porchfest & Youth Symphony Showcase', format: 'Live Music', description: 'Rotating 20-minute acoustic sets celebrating local neighborhood talent.', durationMinutes: 180 },
    ],
    returnGifts: [
      { itemName: 'Wildflower Seed Packets & Sustainable Tote Bags', description: 'Pollinator-friendly local seed mix in biodegradable paper.', recipientGroup: 'All Families', estimatedUnitCost: 3.5 },
    ],
    budgetOptimizations: [
      'Partner with municipal parks department to waive stage permit fees in exchange for community zero-waste pledge.',
      'Recruit volunteer marshals through local colleges for event coordination credit instead of hiring private staffing agencies.',
    ],
    provider: 'UtsavOS Curated Civic Engine (Offline Safe)',
  };
}

function generateRuleBasedAssistantReply(
  userQuery: string,
  ctx: z.infer<typeof AIChatSchema>['eventContext'],
  totalSpent: number,
  remaining: number
): string {
  const q = userQuery.toLowerCase();
  const currency = ctx.currency;

  if (q.includes('cut') || q.includes('save') || q.includes('10%') || q.includes('reduce budget')) {
    const tenPercent = (ctx.totalBudget * 0.1).toFixed(0);
    return `### 💡 How to Cut 10% (${currency} ${Number(tenPercent).toLocaleString()}) from Your Budget

Here is a targeted breakdown specifically for **${ctx.title}**:

1. **Optimize Catering & Beverage (Target: Save ~${currency} ${(Number(tenPercent) * 0.45).toFixed(0)})**
   - For **${ctx.guestCount} guests**, shift from a seated multi-course dinner to upscale dual-station grazing tables.
   - Streamline the bar package to signature cocktails, craft beer, and regional wine rather than an unlimited open top-shelf bar.

2. **Decor & Floral Smart Repurposing (Target: Save ~${currency} ${(Number(tenPercent) * 0.35).toFixed(0)})**
   - Reallocate ceremony floral installations (entrance arches and stage pillars) to the reception head table and photobooth.
   - Blend lush greenery and clustered warm candle votives instead of all-flower centerpieces.

3. **Vendor Contract Adjustments (Target: Save ~${currency} ${(Number(tenPercent) * 0.2).toFixed(0)})**
   - Current engaged vendors: **${ctx.vendors.length}**. Review pending contracts to bundle photography and drone cinematography under one studio team.
   - Adjust media coverage to 8 core hours rather than 12 hours to reduce overtime crew charges.

*Current Financial Status:* Total Budget: **${currency} ${ctx.totalBudget.toLocaleString()}** | Spent to date: **${currency} ${totalSpent.toLocaleString()}** | Available: **${currency} ${remaining.toLocaleString()}**.`;
  }

  if (q.includes('vendor') || q.includes('caterer') || q.includes('photographer')) {
    return `### 🤝 Vendor Checklist & Status for "${ctx.title}"

You currently have **${ctx.vendors.length}** vendors tracked:
${ctx.vendors.map((v) => `- **${v.name}** (${v.category}) — Status: \`${v.status}\` | Balance: ${currency} ${v.balanceDue || 0}`).join('\n')}

**Key Recommendations:**
- Confirm call times and delivery schedules at least 14 days before **${ctx.date}**.
- Ensure all food and equipment vendors have submitted certificates of insurance (COI) to the venue.`;
  }

  if (q.includes('timeline') || q.includes('schedule') || q.includes('milestone')) {
    const completed = ctx.macroMilestones.filter((m) => m.isCompleted).length;
    return `### ⏱️ Timeline Health for "${ctx.title}"

- **Milestone Velocity:** ${completed} of ${ctx.macroMilestones.length} milestones complete.
- **Event Date:** ${ctx.date}

**Next Recommended Priorities:**
${ctx.macroMilestones
  .filter((m) => !m.isCompleted)
  .slice(0, 3)
  .map((m) => `- ⏳ **${m.title}** (Due: ${m.dueDate})`)
  .join('\n')}

Tip: Use our **Auto-Generate Schedule (T-90, T-60, T-30, T-7)** tool in the Timeline tab to automatically populate key checkpoints leading up to your date.`;
  }

  return `### 📋 Planning Assistant Advice for "${ctx.title}"

Thank you for your question! Here is my analysis based on your live event data:
- **Event Date:** ${ctx.date} (${ctx.guestCount} guests expected)
- **Budget Health:** ${currency} ${totalSpent.toLocaleString()} spent of ${currency} ${ctx.totalBudget.toLocaleString()} (${remaining > 0 ? `${currency} ${remaining.toLocaleString()} remaining` : 'Over budget!'})
- **Vendor Pipeline:** ${ctx.vendors.length} vendor partners engaged.

How can I assist further? You can ask me:
- *"How do I cut 10% from my budget?"*
- *"Suggest catering menu ideas for ${ctx.guestCount} guests"*
- *"What are my top timeline checkpoints for this week?"*`;
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✨ UtsavOS Secure API Proxy active on port ${PORT}`);
    console.log(`🔒 Helmet, CORS, and Rate Limiting enabled`);
    console.log(`🤖 Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5)}`);
  });
}

