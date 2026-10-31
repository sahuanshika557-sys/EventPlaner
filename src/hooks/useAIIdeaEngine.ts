import { useState, useCallback } from 'react';
import type { AIConceptIdea, AIEngineParams, DecorConcept, LightingSchematic, InteractiveEngagementIdea } from '../types/ai';
import { generateConceptPrompts, getReliableEventImage } from '../utils/aiImages';

import type { WeddingCulture } from '../types/wedding';

const CULTURE_PALETTES: Record<WeddingCulture, { name: string; hex: string }[]> = {
  north_indian: [
    { name: 'Kesariya Gold', hex: '#FF9933' },
    { name: 'Sindoor Red', hex: '#E30B5C' },
    { name: 'Rani Pink', hex: '#FF007F' },
    { name: 'Haldi Mustard', hex: '#E1AD01' },
    { name: 'Antique Zari', hex: '#D4AF37' },
  ],
  muslim_nikah: [
    { name: 'Royal Emerald', hex: '#046307' },
    { name: 'Pearl Ivory', hex: '#FFFFF0' },
    { name: 'Rose Quartz', hex: '#AA3855' },
    { name: 'Antique Zari Gold', hex: '#C5A059' },
    { name: 'Midnight Teal', hex: '#004D40' },
  ],
  punjabi_sikh: [
    { name: 'Basanti Yellow', hex: '#F4C430' },
    { name: 'Royal Navy', hex: '#002147' },
    { name: 'Rust Orange', hex: '#C45508' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Champagne Gold', hex: '#D4AF37' },
  ],
  south_indian: [
    { name: 'Temple Terracotta', hex: '#CC4E33' },
    { name: 'Mango Leaf Green', hex: '#2E6F40' },
    { name: 'Turmeric Sandal', hex: '#F2B705' },
    { name: 'Pure Kanjeevaram Gold', hex: '#D4AF37' },
    { name: 'Kumkum Red', hex: '#B22222' },
  ],
  fusion_cross_cultural: [
    { name: 'Kesariya Saffron', hex: '#FF9933' },
    { name: 'Rose Quartz', hex: '#AA3855' },
    { name: 'Pure Kanjeevaram Gold', hex: '#D4AF37' },
    { name: 'Royal Navy', hex: '#002147' },
    { name: 'Pearl Ivory', hex: '#FFFFF0' },
  ],
  christian_western: [
    { name: 'Champagne Gold', hex: '#D4AF37' },
    { name: 'Burgundy Velvet', hex: '#800020' },
    { name: 'Blush Rose', hex: '#FFB6C1' },
    { name: 'Ivory Silk', hex: '#FFFFF0' },
    { name: 'Emerald Accent', hex: '#50C878' },
  ],
};

/**
 * Pure generator function to build domain-specific creative concepts
 */
export function buildConceptIdea(params: AIEngineParams): AIConceptIdea {
  let decor: DecorConcept;
  let lighting: LightingSchematic;
  let engagement: InteractiveEngagementIdea[];

  const themeName = params.theme || 'Enchanted Celestial Glow';

  if (params.eventType === 'wedding') {
    const culture: WeddingCulture = params.culture || 'north_indian';
    const palette = CULTURE_PALETTES[culture] || CULTURE_PALETTES.north_indian;

    if (culture === 'muslim_nikah') {
      decor = {
        id: `decor_${Date.now()}`,
        themeTitle: `${themeName} Royal Mughal Court & Nikah Pavilion`,
        colorPalette: palette,
        tablescapeDetails:
          'Emerald velvet runners with antique gold zari embroidery, crystal candle sconces, floral jaali placemats, and bespoke attar scent bottles for each guest.',
        centerpieceConcept:
          'Vintage Mughal urns holding white avalanche roses, emerald greenery, and trailing jasmine with soft candle votives.',
        entranceFocalPoint:
          'An opulent Mughal arch with laser-cut geometric jaali screens, hanging crystal teardrops, and a grand silver calligraphy crest.',
        estimatedBudgetImpact: '15% of total budget allocation',
      };

      lighting = {
        id: `light_${Date.now()}`,
        name: 'Mughal Starlight & Jaali Amber Wash',
        moodType: 'Sacred & Regal',
        zones: [
          {
            zoneName: 'Nikah Stage & Arsi Mushaf Aisle',
            fixtureType: 'Diffused Soft Warm White Spotlights (3000K)',
            colorTemperature: '3000K Soft Warm Daylight',
            instructions: 'Flattering shadow-free illumination across floral curtain and Nikahnama signing table.',
          },
          {
            zoneName: 'Dawat-e-Walima Dining Court',
            fixtureType: 'Crystal Chandeliers & Candle Votives',
            colorTemperature: '2400K Warm Gold Glow',
            instructions: 'Subdued royal ambient glow highlighting emerald and antique gold tablescapes.',
          },
          {
            zoneName: 'Attar Tasting & Welcome Lounge',
            fixtureType: 'Moroccan Pierced Brass Lanterns',
            colorTemperature: '2200K Intimate Amber',
            instructions: 'Intricate geometric shadow patterns cast across velvet drapery.',
          },
        ],
        specialEffects: [
          'Gentle rosewater mist diffusion at arrival portal',
          'Soft warm uplighting highlighting calligraphic arches',
        ],
      };

      engagement = [
        {
          id: `eng_m1`,
          title: 'Royal Attar-Tasting Bar with Customized Scent Keepsakes',
          targetDemographic: 'All Wedding Guests & Families',
          format: 'Sensory Heritage Experience',
          description:
            'An authentic royal Ittar / Attar artisan station offering pure Ruh Gulab, Shamama, Oudh, and Jasmine, bottled in engraved crystal phials with couple crest.',
          executionSteps: [
            'Setup Mughal jaali canopy draped in pastel ivory and emerald silk.',
            'Display glass decanters with hand-lettered scent notes.',
            'Gift personalized miniature attar bottles as wedding favors.',
          ],
          engagementFactor: 9.9,
        },
        {
          id: `eng_m2`,
          title: 'Embroidered Nikahnama Keepsake Ceremony & Signature Table',
          targetDemographic: 'Couple, Qazi & Witnesses',
          format: 'Sacred Islamic Calligraphy Ritual',
          description:
            'Custom handcrafted silk-bordered Nikahnama with gold calligraphy and velvet presentation folio for the solemn Qubool Hai signing.',
          executionSteps: [
            'Commission calligrapher for intricate Thuluth or Naskh script.',
            'Supply feather fountain pens with custom sepia ink.',
            'Frame with carved Arsi Mushaf mirror setup.',
          ],
          engagementFactor: 9.8,
        },
        {
          id: `eng_m3`,
          title: 'Chamak & Manjha Floral Jewelry Craft Station',
          targetDemographic: 'Bridesmaids & Women of all ages',
          format: 'Interactive Adornment Studio',
          description:
            'Artisans craft fresh jasmine venis, marigold necklaces, and gota patti bangles on demand for guests during the pre-wedding festivities.',
          executionSteps: [
            'Source fresh white mogra and carnations each morning.',
            'Station 3 skilled garland artisans at the Manjha welcome pavilion.',
            'Provide branded mirror trays for instant photo moments.',
          ],
          engagementFactor: 9.6,
        },
      ];
    } else if (culture === 'punjabi_sikh') {
      decor = {
        id: `decor_${Date.now()}`,
        themeTitle: `${themeName} Basanti & Gurdwara Darbar Sahib Elegance`,
        colorPalette: palette,
        tablescapeDetails:
          'Rich Basanti yellow and royal navy satin runners, authentic phulkari embroidered accents, and polished brass bowls filled with golden marigolds.',
        centerpieceConcept:
          'Handcrafted brass lanterns surrounded by golden marigolds, wheat sheaves, and fresh white chrysanthemums.',
        entranceFocalPoint:
          'A majestic floral walkway lined with rumalla sahib embroidery patterns, illuminated brass Jaggo lamps, and fresh floral arches.',
        estimatedBudgetImpact: '15% of total budget allocation',
      };

      lighting = {
        id: `light_${Date.now()}`,
        name: 'Darbar Sahib Reverence & Basanti Glow',
        moodType: 'Sacred, Respectful & Festive',
        zones: [
          {
            zoneName: 'Anand Karaj Darbar Sahib Floral Aisle',
            fixtureType: 'High-CRI Warm White LED Pin-Spots (3500K)',
            colorTemperature: '3500K Pure Natural Warmth',
            instructions: 'Respectful, even illumination across Sri Guru Granth Sahib altar and four Laavan circumambulation path.',
          },
          {
            zoneName: 'Jaggo & Bhangra Dance Floor',
            fixtureType: 'Dynamic Moving Heads & Basanti Gold Beams',
            colorTemperature: 'Multi-Color Amber & Gold Spectrum',
            instructions: 'Pulse animations synchronized to live Dhol and folk rhythms.',
          },
          {
            zoneName: 'Langar Seva & Dining Hall',
            fixtureType: 'Diffused Warm Festoon Fixtures',
            colorTemperature: '3000K Soft Illumination',
            instructions: 'Comfortable, welcoming lighting for communal floor and table seating.',
          },
        ],
        specialEffects: [
          'Illuminated brass Jaggo lamps carried during nighttime folk entrance',
          'Sparkler send-off canopy for the emotional Doli farewell',
        ],
      };

      engagement = [
        {
          id: `eng_s1`,
          title: 'Morning Langar Seva & Sacred Karah Parshad Coordination',
          targetDemographic: 'All Sangat & Wedding Guests',
          format: 'Community Sacred Service',
          description:
            'Coordinated communal seating and respectful seva serving hot traditional Langar (dal, rotis, kheer) and warm Karah Parshad in the Gurdwara langar hall.',
          executionSteps: [
            'Distribute ceremonial headscarves (rumaals) at Darbar Sahib entry.',
            'Coordinate family seva teams for serving with devotion and humility.',
            'Ensure biodegradable leaf plates and complete dietary accommodation.',
          ],
          engagementFactor: 9.9,
        },
        {
          id: `eng_s2`,
          title: 'Personalized Kada & Rumalla Sahib Keepsake Station',
          targetDemographic: 'All Guests & Friends',
          format: 'Traditional Punjabi Blessing Keepsakes',
          description:
            'Handcrafted stainless steel or brass Kadas inscribed with traditional Anand Karaj blessing, alongside embroidered phulkari handkerchiefs.',
          executionSteps: [
            'Arrange size-sorted Kadas in polished wooden chests.',
            'Engrave wedding date and ik-onkar emblem on inner rim.',
            'Distribute alongside bilingual Anand Karaj protocol guides.',
          ],
          engagementFactor: 9.7,
        },
        {
          id: `eng_s3`,
          title: 'Traditional Jaggo & Boliyan Interactive Baithak',
          targetDemographic: 'Youth, Elders & Family Flashmob',
          format: 'High-Energy Folk Tradition',
          description:
            'Brass Jaggo pots with battery tea lights carried overhead by maternal aunts, led by live Dhol rhythms and witty family Boliyan singing circles.',
          executionSteps: [
            'Distribute traditional decorated chime sticks (chhaj) and wooden khartals.',
            'Cue live Dhol master for synchronized giddha beats.',
            'Capture high-spirited family dance circles on steadycam.',
          ],
          engagementFactor: 9.8,
        },
      ];
    } else if (culture === 'south_indian') {
      decor = {
        id: `decor_${Date.now()}`,
        themeTitle: `${themeName} Auspicious Temple Mandap & Kanjeevaram Splendor`,
        colorPalette: palette,
        tablescapeDetails:
          'Pristine banana leaf runners flanked by traditional brass Kuthuvilakku oil lamps, tender coconut flower arrangements, and fresh jasmine garlands.',
        centerpieceConcept:
          'Grand brass Urli vessels with floating lotus flowers, yellow marigold petals, and miniature lighted brass ghee lamps.',
        entranceFocalPoint:
          'A temple-style wooden Gopuram archway flanked by live banana trees, mango leaf toran garlands, and fragrant Madurai Malligai canopies.',
        estimatedBudgetImpact: '15% of total budget allocation',
      };

      lighting = {
        id: `light_${Date.now()}`,
        name: 'Deepam Temple Warmth & Sacred Auspiciousness',
        moodType: 'Sacred, Auspicious & Serene',
        zones: [
          {
            zoneName: 'Muhurtham Temple Mandap',
            fixtureType: 'Warm White Pin-Spots (2700K) + Live Brass Deepams',
            colorTemperature: '2700K Deep Gold & Brass Lamp Glow',
            instructions: 'Focused beam on Kanyadaan and Thali Kettu moment; soft fill on priests and family.',
          },
          {
            zoneName: 'Oonjal Swing & Kashi Yatra Staging',
            fixtureType: 'Amber Floral Uplighting',
            colorTemperature: '2400K Candlelight Warmth',
            instructions: 'Warm glow illuminating carved wooden swing and jasmine canopies.',
          },
          {
            zoneName: 'Banana Leaf Sadya Feast Hall',
            fixtureType: 'Natural High-CRI Ceiling Diffusers',
            colorTemperature: '3500K Clean Food-Appetizing Daylight',
            instructions: 'Bright, welcoming light to showcase the vibrant 24-dish vegetarian spread.',
          },
        ],
        specialEffects: [
          'Incense and sambrani aromatic smoke wafting through the temple courtyard',
          'Shower of flower petals and Akshathai at the instant of Thali Kettu',
        ],
      };

      engagement = [
        {
          id: `eng_si1`,
          title: 'Traditional 24-Dish Banana Leaf Feast (Elai Sappadu) Curation',
          targetDemographic: 'All Wedding Guests & Culinary Connoisseurs',
          format: 'Authentic Vedic Gastronomic Feast',
          description:
            'Master chefs serve a grand 24-dish vegetarian feast on fresh plantain leaves, featuring Avial, Poriyal, Sambar, Rasam, and 3 varieties of Payasam following strict ceremonial serving order.',
          executionSteps: [
            'Source pristine plantation-fresh washed banana leaves.',
            'Follow sacred Vedic sequence of salt, pickle, payasam, and rice.',
            'Station servers in traditional veshtis with brass serving vessels.',
          ],
          engagementFactor: 9.9,
        },
        {
          id: `eng_si2`,
          title: 'Authentic Jasmine (Madurai Malli) Fragrance Canopy & Veni Station',
          targetDemographic: 'All Female Guests & Elders',
          format: 'Fragrant Floral Adornment',
          description:
            'Freshly flown Madurai Malligai (jasmine) garlands strung live by master weavers, pinned into guests\' hair alongside traditional brass hairpins.',
          executionSteps: [
            'Procure GI-tagged Madurai jasmine buds packed in ice.',
            'Setup fragrant swing (Oonjal) surrounded by brass kuthuvilakku lamps.',
            'Weave custom venis with rose petals and golden zari thread.',
          ],
          engagementFactor: 9.8,
        },
        {
          id: `eng_si3`,
          title: 'Live Nadaswaram & Thavil Temple Jugalbandi',
          targetDemographic: 'All Attendees & Elders',
          format: 'Auspicious Traditional Temple Music',
          description:
            'Sacred Mangala Vadyam duo playing classical ragas (Hamsadhwani, Kalyani) to invoke divine blessings during Kashi Yatra and Muhurtham.',
          executionSteps: [
            'Position artists on elevated wooden dais flanked by banana stalks.',
            'Synchronize Kettimelam thunderous crescendo at exact Muhurtham timing.',
            'Distribute Akshathai (sacred turmeric rice) to guests for blessing.',
          ],
          engagementFactor: 9.7,
        },
      ];
    } else if (culture === 'fusion_cross_cultural') {
      decor = {
        id: `decor_${Date.now()}`,
        themeTitle: `${themeName} Global Heritage & East-Meets-West Pavilion`,
        colorPalette: palette,
        tablescapeDetails:
          'Contemporary minimalist ceramic dining paired with gold zari silk runners, custom bilingual vow cards, and floating tea light votives.',
        centerpieceConcept:
          'Harmonious fusion of Indian lotus blooms with delicate English garden roses in geometric champagne gold vases.',
        entranceFocalPoint:
          'A dual-culture unity portal intertwining cascading jasmine and wisteria blossoms beneath a warm architectural light beam.',
        estimatedBudgetImpact: '15% of total budget allocation',
      };

      lighting = {
        id: `light_${Date.now()}`,
        name: 'East-Meets-West Melodic Starlight & Fusion Beams',
        moodType: 'Cosmopolitan & Romantic',
        zones: [
          {
            zoneName: 'Dual Ceremony Stage',
            fixtureType: 'Intelligent Warm LED Pin-Spots (3000K)',
            colorTemperature: '3000K Balanced Neutral Warmth',
            instructions: 'Subtle transitions highlighting both sacred fire and unity candle vows.',
          },
          {
            zoneName: 'Global Banquet & Tapas Pavilion',
            fixtureType: 'Dimmed Filament Pendant Fixtures',
            colorTemperature: '2400K Ambient Glow',
            instructions: 'Warm intimate atmosphere for bilingual toasts and family dining.',
          },
          {
            zoneName: 'Dance Floor & Live Fusion Stage',
            fixtureType: 'Moving Head Spotlights & Hazer',
            colorTemperature: 'Dynamic Spectrum',
            instructions: 'Sync lighting pulses with sitar-acoustic DJ crossover tracks.',
          },
        ],
        specialEffects: [
          'Cold spark fountains during joint entrance',
          'Low-lying dry ice fog for couple first dance',
        ],
      };

      engagement = [
        {
          id: `eng_fc1`,
          title: 'Dual-Heritage Vow Books with Sanskrit & English Blessings',
          targetDemographic: 'Couple & Multilingual Guests',
          format: 'Inter-faith Keepsake',
          description:
            'Elegant dual-language vow folios celebrating both traditions with parallel Sanskrit shlokas and modern personal vows.',
          executionSteps: [
            'Bind with saffron and ivory silk cords.',
            'Provide live projected translations for cross-cultural attendees.',
            'Incorporate dual-heritage blessing ceremony.',
          ],
          engagementFactor: 9.8,
        },
        {
          id: `eng_fc2`,
          title: 'East-Meets-West Melodic Fusion Acoustic Stage',
          targetDemographic: 'All Guests',
          format: 'Sitar, Cello & Tabla Live Ensemble',
          description:
            'Acoustic virtuosos blending classical Indian ragas with contemporary orchestral compositions.',
          executionSteps: [
            'Provide subtle acoustic balance across string and percussion elements.',
            'Curate setlist spanning classic ragas to modern love anthems.',
          ],
          engagementFactor: 9.7,
        },
        {
          id: `eng_fc3`,
          title: 'Global Heritage Culinary & Attar Tasting Experience',
          targetDemographic: 'Multi-cultural Guests',
          format: 'Interactive Cultural Discovery',
          description:
            'Interactive culinary pairings and custom fragrance blending honoring both families\' heritages.',
          executionSteps: [
            'Pair traditional sweets with global artisanal desserts.',
            'Create custom his-and-hers scent blend favors.',
          ],
          engagementFactor: 9.6,
        },
      ];
    } else {
      // Default: Hindu / Vedic / North Indian
      decor = {
        id: `decor_${Date.now()}`,
        themeTitle: `${themeName} Vedic Royal Mandap & Palace Courtyard`,
        colorPalette: palette,
        tablescapeDetails:
          'Brass urlis floating with fresh rose petals, marigold table runners, pure copper goblets, and raw silk napkins bound by golden gota ribbons.',
        centerpieceConcept:
          'Tiered brass samai lamps surrounded by circular garlands of fresh orange marigolds, red carnations, and fragrant tuberoses.',
        entranceFocalPoint:
          'A grand royal archway draped in auspicious yellow and crimson fabric with hanging brass bells, torans, and a floral canopy.',
        estimatedBudgetImpact: '15% of total budget allocation',
      };

      lighting = {
        id: `light_${Date.now()}`,
        name: 'Sacred Agni Tungsten & Palace Chandelier Glow',
        moodType: 'Sacred, Royal & Auspicious',
        zones: [
          {
            zoneName: 'Mandap / Altar Staging & Agni Kunda',
            fixtureType: 'Warm White LED Pin-Spots (2700K)',
            colorTemperature: '2700K Warm Tungsten',
            instructions: 'Focused beam on couple, holy agni kunda, and parents; diffused soft fill to avoid harsh shadows.',
          },
          {
            zoneName: 'Banquet Dining Hall & Courtyard',
            fixtureType: 'Dimmable Vintage Filament Chandeliers',
            colorTemperature: '2200K Candlelight Glow',
            instructions: 'Subdued ambient glow at 40% intensity during dinner service.',
          },
          {
            zoneName: 'Sangeet Stage & Baraat Arena',
            fixtureType: 'Intelligent Moving Head Beams & Amber Wash',
            colorTemperature: 'Dynamic Kesariya & Gold Spectrum',
            instructions: 'Sync pulse animations with live dhol beats and folk dance numbers.',
          },
        ],
        specialEffects: [
          'Sacred havan fragrant herbs (loban & camphor) aroma dispersion',
          'Rose petal confetti cannon during Varmala and Saptapadi finale',
        ],
      };

      engagement = [
        {
          id: `eng_h1`,
          title: 'Customized Vow Books with Sanskrit Shlokas',
          targetDemographic: 'Couple, Families & Elders',
          format: 'Sacred Vedic Calligraphy Keepsake',
          description:
            'Handcrafted gold-leaf parchment vow books inscribed with sacred Sanskrit marriage shlokas and English reflections for the Saptapadi vows.',
          executionSteps: [
            'Curate authentic Rig Vedic shlokas with priest approval.',
            'Hand-bind into maroon velvet covers with gold zari tassels.',
            'Present during the Agni Pradakshina ceremony.',
          ],
          engagementFactor: 9.8,
        },
        {
          id: `eng_h2`,
          title: 'Live Shehnai & Sitar Jugalbandi Ensemble',
          targetDemographic: 'All Wedding Guests & Connoisseurs',
          format: 'Classical Acoustic Performance',
          description:
            'Master Shehnai and Sitar maestros playing morning and evening raga variations (Bhairavi & Yaman) during guest arrival and Baraat welcome.',
          executionSteps: [
            'Position elevated carpeted baithak with brass urli marigolds.',
            'Mic instruments with vintage cardioid microphones.',
            'Coordinate tempo crescendo as the Baraat enters the mandap.',
          ],
          engagementFactor: 9.7,
        },
        {
          id: `eng_h3`,
          title: 'Royal Phoolon ki Chaadar Bridal Canopy Walk',
          targetDemographic: 'Bridal Procession & Entire Assembly',
          format: 'Traditional Floral Processional',
          description:
            'Hand-woven fresh tuberose, lotus and red rose floral canopy carried by brothers and maternal uncles as the bride walks to the Mandap.',
          executionSteps: [
            'Construct lightweight bamboo trellis adorned with cascading rajnigandha.',
            'Coordinate slow processional walk timed with Shehnai crescendo.',
            'Illuminate with warm fairy micro-lights within the flower mesh.',
          ],
          engagementFactor: 9.9,
        },
      ];
    }
  } else if (params.eventType === 'birthday') {
    decor = {
      id: `decor_${Date.now()}`,
      themeTitle: `${themeName} Kinetic Celebration`,
      colorPalette: [
        { name: 'Electric Violet', hex: '#7C3AED' },
        { name: 'Neon Coral', hex: '#FF6B6B' },
        { name: 'Sunburst Gold', hex: '#F59E0B' },
        { name: 'Deep Midnight', hex: '#1E1B4B' },
        { name: 'Bright Cyan', hex: '#06B6D4' },
      ],
      tablescapeDetails:
        'Geometric mirror tiles, metallic confetti chargers, personalized trivia coasters with celebrant funny facts, and glow wristbands wrapped in napkins.',
      centerpieceConcept:
        'Custom acrylic neon light silhouettes matching the celebrant’s favorite icon surrounded by micro succulent planters that guests take home.',
      entranceFocalPoint:
        'Multi-layered 3D photo wall with customized retro marquee letters and shimmering iridescent tinsel curtain.',
      estimatedBudgetImpact: '12% of total budget allocation',
    };

    lighting = {
      id: `light_${Date.now()}`,
      name: 'Neon Horizon & Vibrant Party Wash',
      moodType: 'High-Energy & Celebratory',
      zones: [
        {
          zoneName: 'Cake Table & Photo Backdrop',
          fixtureType: 'Custom LED Neon Script Signage & Dual Softboxes',
          colorTemperature: '4000K Neutral Crisp Light',
          instructions: 'Even, flattering beauty lighting for smartphones and group selfies.',
        },
        {
          zoneName: 'Game & Lounge Arena',
          fixtureType: 'UV Blacklights & Pixel Neon Tubes',
          colorTemperature: 'Ultraviolet 395nm + RGB chasing',
          instructions: 'Activate fluorescent elements and glow-in-the-dark props during games.',
        },
      ],
      specialEffects: [
        'Confetti cannon burst at exact moment candles are extinguished',
        'Bubble machine with vapor fog filling for dance circle kickoff',
      ],
    };

    engagement = [
      {
        id: `eng_b1`,
        title: 'Live Smartphone Interactive Trivia Showdown',
        targetDemographic: 'Party Guests & Friends',
        format: 'Digital Gamified Challenge',
        description:
          'Fast-paced Kahoot-style quiz featuring 10 humorous questions about the celebrant’s life adventures, with live leaderboard projections on a projector screen.',
        executionSteps: [
          'Pre-load 10 trivia questions with photos into trivia software.',
          'Display QR code on table tent cards for 10-second smartphone join.',
          'Award customized trophy and gag gifts to top 3 winners.',
        ],
        engagementFactor: 9.7,
      },
      {
        id: `eng_b2`,
        title: 'Gourmet Nitrogen Ice Cream & S’mores Bar',
        targetDemographic: 'Kids & Sweet Tooth Adults',
        format: 'Live Culinary Theater',
        description:
          'Chefs flash-freeze custom dessert bowls in clouds of liquid nitrogen vapor, followed by tabletop mini roasting torches for golden s’mores.',
        executionSteps: [
          'Secure safety food-grade liquid nitrogen station with clear barrier.',
          'Offer 6 artisanal toppings: honeycomb crumbles, berry coulis, salted pretzel.',
          'Coordinate service window right after the cake cutting ritual.',
        ],
        engagementFactor: 9.5,
      },
      {
        id: `eng_b3`,
        title: '360-Degree Slow-Motion Video Glitz Pod',
        targetDemographic: 'Teens, Young Adults & Social Creators',
        format: 'High-Tech Video Booth',
        description:
          'Guests stand on a round podium while an automated camera arm spins at 120fps, generating instant boomerang videos with theme overlays.',
        executionSteps: [
          'Reserve 10ft x 10ft perimeter with velvet stanchions.',
          'Provide fun props: money guns, inflatable guitars, oversized shades.',
          'Direct AirDrop & QR instant video downloads for immediate social sharing.',
        ],
        engagementFactor: 9.9,
      },
    ];
  } else {
    // Community Event
    decor = {
      id: `decor_${Date.now()}`,
      themeTitle: `${themeName} Civic Unity Festival`,
      colorPalette: [
        { name: 'Eco Forest Green', hex: '#059669' },
        { name: 'Sunshine Yellow', hex: '#EAB308' },
        { name: 'Sky Azure', hex: '#0284C7' },
        { name: 'Terracotta Clay', hex: '#C2410C' },
        { name: 'Pure White', hex: '#FFFFFF' },
      ],
      tablescapeDetails:
        '100% biodegradable bamboo composite dining setups, recycled canvas signage, water refill hydration station maps, and native wildflower pots.',
      centerpieceConcept:
        'Living miniature herb gardens labeled with community garden tips, adopted by local families at event closing.',
      entranceFocalPoint:
        'A communal fabric ribbon unity gateway where entering attendees tie a colored ribbon carrying their community wish.',
      estimatedBudgetImpact: '8% of total budget allocation',
    };

    lighting = {
      id: `light_${Date.now()}`,
      name: 'Solar-Powered Fairground & Safety Perimeter Glow',
      moodType: 'Welcoming, Accessible & Safe',
      zones: [
        {
          zoneName: 'Main Community Stage',
          fixtureType: 'High-CRI Warm Floodlights (3000K)',
          colorTemperature: '3000K Warm Natural Daylight',
          instructions: 'Ensure complete visibility for sign language interpreters and community speakers.',
        },
        {
          zoneName: 'Public Walkways & Exits',
          fixtureType: 'IP65 Rated Solar Festoon String Lights',
          colorTemperature: '2700K Soft Illumination',
          instructions: 'Maintain minimum 5 foot-candles along all egress paths and wheelchair ramps.',
        },
        {
          zoneName: 'First Aid & Security Tents',
          fixtureType: 'Uninterrupted Battery-Backed White Spotlights',
          colorTemperature: '5000K High Visibility Daylight',
          instructions: 'Clear illuminated beacon flags visible from any angle in the festival park.',
        },
      ],
      specialEffects: [
        'Eco-friendly laser light mapping across historic town hall facade',
        'Illuminated floating lanterns on park pond with retrieval safety lines',
      ],
    };

    engagement = [
      {
        id: `eng_c1`,
        title: 'Collaborative Giant Community Mosaic Mural',
        targetDemographic: 'All Neighborhood Residents & Kids',
        format: 'Public Co-Creation Art Installation',
        description:
          'A 16-foot wooden mural outlined by a local artist where every attendee paints one numbered square tile representing collective unity.',
        executionSteps: [
          'Prime 4x8 ft exterior plywood panels with paint-by-numbers grid.',
          'Distribute non-toxic washable acrylic paints and aprons.',
          'Permanently seal and donate the completed mural to the community center.',
        ],
        engagementFactor: 9.8,
      },
      {
        id: `eng_c2`,
        title: 'Local Artisan Taste & Cultural Exchange Pavilion',
        targetDemographic: 'Families & Food Enthusiasts',
        format: 'Culinary Passport Tour',
        description:
          'Attendees receive a festival passport and collect stamps as they sample miniature heritage dishes prepared by local family-owned eateries.',
        executionSteps: [
          'Standardize $3 sample portion sizes across 12 participating vendors.',
          'Provide compost bins next to each booth with volunteer monitors.',
          'Raffle community gift baskets for completed stamped passports.',
        ],
        engagementFactor: 9.6,
      },
      {
        id: `eng_c3`,
        title: 'Acoustic Porchfest & Community Open Mic Stage',
        targetDemographic: 'Music Lovers of All Ages',
        format: 'Inclusive Performance Platform',
        description:
          'Rotating 15-minute sets showcasing neighborhood youth choirs, folk duos, poets, and senior band performers in an intimate acoustic garden setting.',
        executionSteps: [
          'Create online sign-up portal with walk-up slots reserved for locals.',
          'Provide house acoustic guitars, electric piano, and pro sound engineer.',
          'Distribute picnic blankets for relaxed family listening.',
        ],
        engagementFactor: 9.4,
      },
    ];
  }

  // Synthesize concept image prompts and bulletproof visual image URLs
  const prompts = generateConceptPrompts(params.eventType, themeName, params.venueEnvironment || 'Hybrid / Pavilion');
  decor.imageUrl = getReliableEventImage(params.eventType, 'decor', 0);
  decor.imagePrompt = prompts.decorPrompt;

  lighting.imageUrl = getReliableEventImage(params.eventType, 'lighting', 0);
  lighting.imagePrompt = prompts.lightingPrompt;

  if (engagement.length > 0) {
    engagement[0].imageUrl = getReliableEventImage(params.eventType, 'experience', 0);
    engagement[0].imagePrompt = prompts.experiencePrompt;
  }

  return {
    id: `ai_concept_${Date.now()}`,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    eventType: params.eventType,
    themePrompt: themeName,
    decorConcept: decor,
    lightingSchematic: lighting,
    engagementIdeas: engagement,
    decorImageUrl: decor.imageUrl,
    lightingImageUrl: lighting.imageUrl,
    experienceImageUrl: engagement[0]?.imageUrl,
  };
}

export function useAIIdeaEngine() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedIdea, setLastGeneratedIdea] = useState<AIConceptIdea>(() =>
    buildConceptIdea({
      eventType: 'wedding',
      theme: 'Enchanted Celestial Glow',
      guestCount: 150,
      demographics: 'Multi-generational, Families & Friends',
      budgetTier: 'Classic Elegance',
      venueEnvironment: 'Hybrid / Pavilion',
    })
  );

  const generateIdeas = useCallback(async (params: AIEngineParams): Promise<AIConceptIdea> => {
    setIsGenerating(true);

    // Simulate generative synthesis delay if not in test
    const isTest = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
    if (!isTest) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const result = buildConceptIdea(params);
    setLastGeneratedIdea(result);
    setIsGenerating(false);
    return result;
  }, []);

  return {
    isGenerating,
    lastGeneratedIdea,
    generateIdeas,
  };
}
