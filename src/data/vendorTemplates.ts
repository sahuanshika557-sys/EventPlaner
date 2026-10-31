import type { VendorItem, VendorCategory, VendorStatus } from '../types/vendor';

export interface VendorTemplateItem {
  name: string;
  category: VendorCategory;
  service: string;
  suggestedCost: number;
  contactPerson: string;
  email: string;
  phone: string;
  notes: string;
}

export const WEDDING_VENDOR_TEMPLATES: VendorTemplateItem[] = [
  {
    name: 'Royal Heritage Palace & Lawns',
    category: 'Venue',
    service: 'Full Ballroom, Banquet Grounds & Bridal Suites',
    suggestedCost: 20000,
    contactPerson: 'Samantha Vance',
    email: 'events@heritagepalace.com',
    phone: '+1 (555) 234-5678',
    notes: 'Access from 06:00 AM; includes tables, banquet chairs, and bridal dressing suites.',
  },
  {
    name: 'Saffron & Spice Culinary Guild',
    category: 'Catering',
    service: 'Live Tandoor, Multi-Cuisine Banquet & Mocktail Bar',
    suggestedCost: 17500,
    contactPerson: 'Chef Devendra',
    email: 'catering@saffronspice.com',
    phone: '+1 (555) 345-6789',
    notes: 'Menu tasting scheduled 30 days prior; final dietary headcount due 14 days prior.',
  },
  {
    name: 'Luxe Flora & Botanical Mandap',
    category: 'Decor & Florals',
    service: 'Mandap, Entrance Floral Arch, Tablescapes & Stage',
    suggestedCost: 9000,
    contactPerson: 'Maya Lin',
    email: 'design@luxeflora.com',
    phone: '+1 (555) 456-7890',
    notes: 'Includes teardown at 01:00 AM; flame-retardant fabric certificate provided.',
  },
  {
    name: 'Cinematic Stories Photo & Drone',
    category: 'Photography & Video',
    service: '3 Lead Shooters, 4K Drone Footage, Highlights Reel',
    suggestedCost: 6000,
    contactPerson: 'Marcus Thorne',
    email: 'info@cinematicstories.com',
    phone: '+1 (555) 567-8901',
    notes: 'Raw footage delivered within 7 business days; master album in 30 days.',
  },
  {
    name: 'Dhol Beats & DJ Soundstage',
    category: 'Music & DJ',
    service: 'Live Dhol Drummers, Sound Rig & Moving Head Lights',
    suggestedCost: 2500,
    contactPerson: 'DJ Rohit',
    email: 'bookings@rohitbeats.com',
    phone: '+1 (555) 678-9012',
    notes: 'Sound limiter compliant with municipal 85dB indoor guidelines.',
  },
];

export const BIRTHDAY_VENDOR_TEMPLATES: VendorTemplateItem[] = [
  {
    name: 'Nova Adventure Arena & Dome',
    category: 'Venue',
    service: 'Exclusive Laser Tag Arena & Private Party Lounge',
    suggestedCost: 2800,
    contactPerson: 'Rick Taylor',
    email: 'parties@novadome.com',
    phone: '+1 (555) 123-4567',
    notes: 'Includes dedicated party host and 2 hours of laser arena game sessions.',
  },
  {
    name: 'Sweet Art Sugar & Custom Bakery',
    category: 'Catering',
    service: '3D Fondant Milestone Cake & Themed Cookies',
    suggestedCost: 650,
    contactPerson: 'Chloe Dupuis',
    email: 'cakes@sweetart.com',
    phone: '+1 (555) 234-5678',
    notes: 'Nut-free kitchen certified; delivered 2 hours before party start.',
  },
  {
    name: 'Kaleidoscope Balloon Sculptors',
    category: 'Decor & Florals',
    service: 'Organic Balloon Arch, Marquee Numbers & Glow Props',
    suggestedCost: 750,
    contactPerson: 'Jordan Lee',
    email: 'decor@kaleidoscopeballoons.com',
    phone: '+1 (555) 345-6789',
    notes: 'Biodegradable latex balloons; installation starts 3 hours prior.',
  },
  {
    name: 'Illusionist Magic & Game Animators',
    category: 'Music & DJ',
    service: 'Interactive Stage Magic, VR Agility Games & Sound',
    suggestedCost: 900,
    contactPerson: 'Captain Cosmic Team',
    email: 'magic@cosmicanimators.com',
    phone: '+1 (555) 456-7890',
    notes: 'Engaging for multi-age kids and families; safety props included.',
  },
  {
    name: 'SnapShot Polaroid & 360 Booth',
    category: 'Photography & Video',
    service: '360 Video Pod, Instant Prints & Digital Gallery',
    suggestedCost: 800,
    contactPerson: 'Elena Rostova',
    email: 'booth@snapshots.com',
    phone: '+1 (555) 567-8901',
    notes: 'Unlimited 4x6 printouts with custom birthday logo watermark.',
  },
];

export const COMMUNITY_VENDOR_TEMPLATES: VendorTemplateItem[] = [
  {
    name: 'Tri-County Stage, Barriers & Truss',
    category: 'Venue',
    service: 'Outdoor Covered Stage, Egress Barriers & Tents',
    suggestedCost: 11500,
    contactPerson: 'Frank Miller',
    email: 'logistics@tricountystage.com',
    phone: '+1 (555) 890-1234',
    notes: 'Wind-load certified to 45 mph; includes ADA wheelchair access ramp.',
  },
  {
    name: 'SafeSound Solar Pro Audio Rig',
    category: 'Lighting & AV',
    service: 'Solar-Hybrid Quiet Generators & 10KW Audio PA',
    suggestedCost: 3500,
    contactPerson: 'Leila Chen',
    email: 'rentals@safesound.com',
    phone: '+1 (555) 901-2345',
    notes: 'Zero-emission solar battery packs with backup inverter.',
  },
  {
    name: 'Artisan Food Truck Collective',
    category: 'Catering',
    service: 'Coordinated Gourmet Mobile Trucks & Hydration Hub',
    suggestedCost: 9500,
    contactPerson: 'Marcus Vance',
    email: 'trucks@oakridgefoodies.org',
    phone: '+1 (555) 012-3456',
    notes: 'All 8 trucks certified with County Health Board food-handling permits.',
  },
  {
    name: 'EcoClean Zero-Waste & Sanitation',
    category: 'Security & Safety',
    service: 'Sorting Stations, Compost Bins & ADA Restrooms',
    suggestedCost: 3200,
    contactPerson: 'Patricia Gale',
    email: 'dispatch@ecocleansanitation.com',
    phone: '+1 (555) 123-7890',
    notes: 'Waste audit guaranteed >= 85% diversion from municipal landfill.',
  },
  {
    name: 'Civic Guardian First Aid & Paramedics',
    category: 'Security & Safety',
    service: 'Dedicated Mobile Ambulance & Dual AED Tents',
    suggestedCost: 2800,
    contactPerson: 'Capt. Donald Harris',
    email: 'dispatch@civicparamedics.gov',
    phone: '+1 (555) 234-8901',
    notes: 'Four state-licensed EMTs on duty throughout operating hours.',
  },
];

/**
 * Creates default vendor items from template for a given domain
 */
export function createDefaultVendorsFromTemplate(
  domain: 'wedding' | 'birthday' | 'community'
): VendorItem[] {
  let list: VendorTemplateItem[];
  if (domain === 'birthday') list = BIRTHDAY_VENDOR_TEMPLATES;
  else if (domain === 'community') list = COMMUNITY_VENDOR_TEMPLATES;
  else list = WEDDING_VENDOR_TEMPLATES;

  return list.map((t, idx) => ({
    id: `template_vendor_${domain}_${idx}_${Date.now()}`,
    name: t.name,
    category: t.category,
    service: t.service,
    contactPerson: t.contactPerson,
    email: t.email,
    phone: t.phone,
    status: (idx === 0 ? 'Contract Signed' : idx === 1 ? 'Deposit Paid' : 'Contacted') as VendorStatus,
    contractAmount: t.suggestedCost,
    depositPaid: idx === 0 ? Math.round(t.suggestedCost * 0.5) : idx === 1 ? Math.round(t.suggestedCost * 0.3) : 0,
    balanceDue: idx === 0 ? Math.round(t.suggestedCost * 0.5) : idx === 1 ? Math.round(t.suggestedCost * 0.7) : t.suggestedCost,
    balanceDueDate: '2026-11-15',
    notes: t.notes,
  }));
}

