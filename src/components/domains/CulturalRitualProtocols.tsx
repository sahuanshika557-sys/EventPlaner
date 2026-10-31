import React, { useState, useEffect, useMemo } from 'react';
import type { WeddingCulture } from '../../types/wedding';
import type { BudgetCategory } from '../../types/budget';
import { Badge } from '../common/Badge';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import {
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ProtocolChecklistItem {
  id: string;
  title: string;
  description: string;
  quantity?: string;
  leadPerson?: string;
  timing?: string;
  isCompleted: boolean;
  category: 'samagri' | 'pandit' | 'turban' | 'chaadar' | 'gurdwara' | 'nikahnama' | 'sadya' | 'yatra' | 'oonjal' | 'jasmine' | 'general';
}

interface CulturalRitualProtocolsProps {
  culture: WeddingCulture;
  onAddBudgetItem?: (item: { name: string; category: BudgetCategory; estimatedCost: number; actualCost: number }) => void;
  onAddTimelineEntry?: (entry: { time: string; durationMinutes: number; title: string; owner: string; location: string; milestone: string; status: 'scheduled' }) => void;
}

const DEFAULT_PROTOCOLS: Record<WeddingCulture, { moduleTitle: string; moduleSubtitle: string; items: ProtocolChecklistItem[] }> = {
  north_indian: {
    moduleTitle: 'Vedic Wedding Operational & Mandap Ritual Engine',
    moduleSubtitle: 'Comprehensive puja samagri, Pandit Ji muhurat schedule, Safa bandhi, and Phoolon ki Chaadar logistics.',
    items: [
      // 1. Mandap Samagri Checklist
      {
        id: 'h_1',
        title: 'Havan Kund & Mango Wood (Aam ki Lakdi)',
        description: 'Consecrated copper havan altar with 5kg dry mango wood, havan samagri herbs, and pure ghee ladle.',
        quantity: '1 Set + 5kg Wood',
        leadPerson: 'Priest Coordinator',
        timing: '08:30 AM (Mandap Setup)',
        isCompleted: false,
        category: 'samagri',
      },
      {
        id: 'h_2',
        title: 'Pure Desi Cow Ghee (A2 Ghee)',
        description: '2 liters of unadulterated desi ghee in brass lota for sacred Agni Pradakshina oblations.',
        quantity: '2 Liters',
        leadPerson: 'Groom Family Elder',
        timing: '09:00 AM',
        isCompleted: false,
        category: 'samagri',
      },
      {
        id: 'h_3',
        title: 'Betel Nuts (Supari) & Fresh Paan Leaves',
        description: '21 whole unbroken Supari nuts, 25 fresh green betel leaves for Gauri-Ganesh sthapana.',
        quantity: '21 Supari + 25 Paan',
        leadPerson: 'Bride Mother',
        timing: '09:00 AM',
        isCompleted: false,
        category: 'samagri',
      },
      {
        id: 'h_4',
        title: 'Holy Gangajal, Kalash & Coconut (Nariyal)',
        description: 'Brass Kalash filled with holy water, 5 mango leaves, and unbroken dry coconut wrapped in sacred mauli.',
        quantity: '2 Kalash Sets',
        leadPerson: 'Pandit Ji Assistant',
        timing: '09:15 AM',
        isCompleted: false,
        category: 'samagri',
      },
      {
        id: 'h_5',
        title: 'Bhimseni Camphor (Kapoor) & Agarbatti',
        description: 'Pure natural camphor cubes and fragrant sandalwood dhoop sticks for aarti ceremonies.',
        quantity: '250g Kapoor + 2 Packs',
        leadPerson: 'Puja Volunteer',
        timing: '09:30 AM',
        isCompleted: false,
        category: 'samagri',
      },
      // 2. Pandit Ji Dakshina & Muhurat Timings
      {
        id: 'h_6',
        title: 'Shubh Vivah Lagna Muhurat Window',
        description: 'Astronomical auspicious window (10:15 AM - 11:45 AM) verified with family priest for Varmala & 7 Pheras.',
        quantity: 'Strict 90-min window',
        leadPerson: 'Head Priest (Pandit Ji)',
        timing: '10:15 AM - 11:45 AM',
        isCompleted: false,
        category: 'pandit',
      },
      {
        id: 'h_7',
        title: 'Pandit Ji Dakshina, Dhoti & Shawl Honorarium',
        description: 'Traditional cash honorarium envelope alongside pure silk dhoti, kurta piece, and pashmina shawl.',
        quantity: '1 Honorarium Folio',
        leadPerson: 'Bride Father',
        timing: 'Post-Vidaai Blessing',
        isCompleted: false,
        category: 'pandit',
      },
      // 3. Safa & Turban Bandhi Logistics
      {
        id: 'h_8',
        title: 'Groom Royal Safa with Vintage Kalgi',
        description: 'Hand-draped royal chanderi silk pagri adorned with heritage emerald, polki feather kalgi, and pearls.',
        quantity: '1 Groom Master Safa',
        leadPerson: 'Master Turban Artisan',
        timing: '09:30 AM (Groom Suite)',
        isCompleted: false,
        category: 'turban',
      },
      {
        id: 'h_9',
        title: 'Barati Turban Tying Station (45 Turbans)',
        description: 'Saffron-gold kota doria turbans draped for all groom-side male family members with matching brooches.',
        quantity: '45 Turbans',
        leadPerson: 'Turban Tying Team (2 Artists)',
        timing: '10:00 AM (Hotel Lobby)',
        isCompleted: false,
        category: 'turban',
      },
      // 4. Phoolon ki Chaadar Coordination
      {
        id: 'h_10',
        title: 'Phoolon ki Chaadar Bamboo Trellis Fabrication',
        description: 'Lightweight bamboo frame woven with cascading fresh tuberose (rajnigandha), red roses, and micro fairy LEDs.',
        quantity: '6x4 ft Trellis Canopy',
        leadPerson: 'Master Florist Lead',
        timing: '10:45 AM (Aisle Holding)',
        isCompleted: false,
        category: 'chaadar',
      },
      {
        id: 'h_11',
        title: '4 Bearers Alignment & Shehnai Crescendo Cue',
        description: 'Maternal uncles and brothers briefed on slow synchronized walk speed, timed with live Shehnai jugalbandi.',
        quantity: '4 Designated Bearers',
        leadPerson: 'Bridal Coordinator',
        timing: '11:00 AM (Bridal Entrance)',
        isCompleted: false,
        category: 'chaadar',
      },
    ],
  },
  punjabi_sikh: {
    moduleTitle: 'Anand Karaj Gurdwara Protocol & Langar Sewa Engine',
    moduleSubtitle: 'Head coverings, Sri Guru Granth Sahib altar protocols, Ragi Jatha, Milni garlands, and community langar.',
    items: [
      {
        id: 's_1',
        title: 'Ceremonial Head Coverings (Rumaals / Chunnis)',
        description: '150 saffron & navy headscarves placed at the Darbar Sahib entry console with shoe check tokens.',
        quantity: '150 Pieces',
        leadPerson: 'Hospitality Lead',
        timing: '09:00 AM (Gurdwara Foyer)',
        isCompleted: false,
        category: 'gurdwara',
      },
      {
        id: 's_2',
        title: 'Darbar Sahib Floor Seating & Gaddi Alignment',
        description: 'Pristine white sheets, cushioned floor seating for sangat, and velvet gaddi for the couple.',
        quantity: 'Full Hall Setup',
        leadPerson: 'Gurdwara Sewadar',
        timing: '09:30 AM',
        isCompleted: false,
        category: 'gurdwara',
      },
      {
        id: 's_3',
        title: 'Rumalla Sahib Embroidered Silk Offering',
        description: 'Royal navy & basanti gold embroidered silk Rumalla Sahib presented with reverence to Sri Guru Granth Sahib.',
        quantity: '1 Ceremonial Set',
        leadPerson: 'Couple & Parents',
        timing: '10:00 AM (Matha Tekna)',
        isCompleted: false,
        category: 'gurdwara',
      },
      {
        id: 's_4',
        title: 'Ragi Jatha Honorarium & 4 Sacred Laavan Singing',
        description: 'Gift envelopes and Siropas prepared for the Bhai Sahib and Ragi Jatha reciting the sacred marriage hymns.',
        quantity: '3 Siropas + Honorarium',
        leadPerson: 'Groom Father',
        timing: '10:45 AM (Laavan Solemnization)',
        isCompleted: false,
        category: 'gurdwara',
      },
      {
        id: 's_5',
        title: 'Milni Garlands & Shagan Dry Fruit Trays',
        description: '6 pairs of matching rose garlands and silver trays with dry fruits exchanged between corresponding male elders.',
        quantity: '6 Milni Pairs',
        leadPerson: 'Maternal Uncles',
        timing: '09:45 AM (Gurdwara Courtyard)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 's_6',
        title: 'Warm Karah Parshad Preparation & Distribution',
        description: 'Traditional consecrated wheat, sugar, and ghee parshad prepared with devotion and distributed after Ardas.',
        quantity: 'Fresh Batch for 200 Sangat',
        leadPerson: 'Gurdwara Langar Kitchen',
        timing: '11:30 AM (Post-Ardas)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 's_7',
        title: 'Communal Langar Sewa Coordination',
        description: 'Pangat floor runners, hot dal makhani, rotis, sabzi, kheer, and 8 family volunteers coordinating service.',
        quantity: 'Full Langar Service',
        leadPerson: 'Langar Committee Lead',
        timing: '12:00 PM (Langar Hall)',
        isCompleted: false,
        category: 'general',
      },
    ],
  },
  muslim_nikah: {
    moduleTitle: 'Nikah Documentation, Qazi Protocol & Walima Engine',
    moduleSubtitle: 'Official Nikahnama desk, Mehr verification, Arsi Mushaf mirror ritual, and Sehra Bandi fanfare.',
    items: [
      {
        id: 'm_1',
        title: 'Handcrafted Silk Nikahnama & Calligraphy Desk',
        description: 'Official Islamic marriage contract folio with gold leaf Thuluth script, archival sepia ink, and feather pen.',
        quantity: '1 Official Folio + 2 Copies',
        leadPerson: 'Legal Documentation Lead',
        timing: '10:30 AM (Nikah Stage)',
        isCompleted: false,
        category: 'nikahnama',
      },
      {
        id: 'm_2',
        title: 'Mehr Amount Verification & Gold Witness Records',
        description: 'Mutually agreed prompt and deferred Mehr gold/cash verified with both families and recorded in contract.',
        quantity: 'Documented & Sealed',
        leadPerson: 'Venerated Qazi & Elders',
        timing: '10:45 AM',
        isCompleted: false,
        category: 'nikahnama',
      },
      {
        id: 'm_3',
        title: 'Two Adult Sane Witnesses (Gawah) Formal Signing',
        description: 'Two verified witnesses from both families present to attest and sign the official marriage registry.',
        quantity: '2 Signed Attestations',
        leadPerson: 'Appointed Family Witnesses',
        timing: '11:15 AM',
        isCompleted: false,
        category: 'nikahnama',
      },
      {
        id: 'm_4',
        title: 'Qazi Protocol & Khutbah-e-Nikah Recitation',
        description: 'Welcome reception for Qazi Sahib, recitation of the sacred marital sermon, and three-fold Qubool Hai affirmations.',
        quantity: 'Honorarium + Choga/Shawl',
        leadPerson: 'Groom Uncle',
        timing: '11:00 AM (Nikah Ceremony)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'm_5',
        title: 'Groom Sehra Bandi & Attar Station Welcome',
        description: 'Delicate floral and pearl sehra tied across groom forehead by sisters; authentic sandalwood/rose attar dabbed for guests.',
        quantity: '1 Master Sehra + 200 Scent Dabs',
        leadPerson: 'Groom Sisters',
        timing: '10:00 AM (Baraat Departure)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'm_6',
        title: 'Arsi Mushaf Antique Mirror Ritual',
        description: 'Ornate carved mirror placed under green silk canopy where couple shares first eye contact reflection.',
        quantity: '1 Antique Mirror + Quran Canopy',
        leadPerson: 'Bride Sister',
        timing: '11:45 AM (Post-Nikah Stage)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'm_7',
        title: 'Grand Dawat-e-Walima Royal Banquet Layout',
        description: 'Ivory and emerald dining court featuring royal Mughlai dum biryani, sheermal, kebabs, and badami phirni.',
        quantity: 'Banquet for 250 Guests',
        leadPerson: 'Master Chef & Host Family',
        timing: '07:30 PM (Reception Gala)',
        isCompleted: false,
        category: 'general',
      },
    ],
  },
  south_indian: {
    moduleTitle: 'Muhurtham Temple Mandap & 24-Dish Sadya Engine',
    moduleSubtitle: 'Kashi Yatra umbrella, Oonjal swing decor, Thali Kettu kettimelam timing, and banana leaf feast.',
    items: [
      {
        id: 'si_1',
        title: 'Kashi Yatra Decorated Silk Umbrella & Scripture',
        description: 'Multicolored silk umbrella with mirror embroidery, carved walking stick, Bhagavad Gita, and wooden paduka sandals.',
        quantity: '1 Complete Kashi Yatra Set',
        leadPerson: 'Groom Maternal Uncle',
        timing: '08:30 AM (Temple Courtyard)',
        isCompleted: false,
        category: 'yatra',
      },
      {
        id: 'si_2',
        title: 'Father-of-the-Bride Persuasion & Welcoming',
        description: 'Bride father intercepts the groom on mock pilgrimage, washing feet and inviting him to enter the sacred grihastha ashram.',
        quantity: 'Brass Urli + Rosewater',
        leadPerson: 'Bride Father',
        timing: '08:45 AM',
        isCompleted: false,
        category: 'yatra',
      },
      {
        id: 'si_3',
        title: 'Carved Teakwood Oonjal (Swing) Garland Wrapping',
        description: 'Suspended swing draped with authentic fragrant jasmine (Madurai Malli), marigold ropes, and fresh coconut leaves.',
        quantity: '1 Teakwood Swing Setup',
        leadPerson: 'Floral Production Team',
        timing: '09:00 AM (Oonjal Lawn)',
        isCompleted: false,
        category: 'oonjal',
      },
      {
        id: 'si_4',
        title: '5 Sumangali Women Oonjal Song & Pidi Suthal',
        description: '5 married elder women singing auspicious Oonjal folk songs, waving colored turmeric/kumkum rice balls to dispel evil eye.',
        quantity: '4 Rice Ball Plates + Milk/Bananas',
        leadPerson: 'Maternal Aunts',
        timing: '09:15 AM',
        isCompleted: false,
        category: 'oonjal',
      },
      {
        id: 'si_5',
        title: 'Auspicious Muhurtham & Thali Kettu Timing',
        description: 'Exact astrological subha muhurtham window for tying the sacred Mangalsutra (Thali) with thunderous Kettimelam drums.',
        quantity: 'Golden Thali + Yellow Thread',
        leadPerson: 'Head Priest (Vadhyar)',
        timing: '09:45 AM - 10:15 AM',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'si_6',
        title: 'GI-Tagged Madurai Malligai (Jasmine) Veni Procurement',
        description: 'Fresh Madurai jasmine garlands preserved in ice boxes, hand-woven into bridal hair braid alongside red carnation borders.',
        quantity: '10 Meters Garlands + 80 Hair Venis',
        leadPerson: 'Jasmine Weaver Artisan',
        timing: '07:30 AM (Bridal Dressing Suite)',
        isCompleted: false,
        category: 'jasmine',
      },
      {
        id: 'si_7',
        title: 'Traditional 24-Dish Banana Leaf Feast (Elai Sappadu)',
        description: 'Pristine plantation-fresh banana leaves placed with tips pointing left; 24-dish vegetarian Sadya served in strict Vedic sequence.',
        quantity: '24 Authentic Dishes',
        leadPerson: 'Master Sadya Caterer',
        timing: '12:00 PM (Dining Hall)',
        isCompleted: false,
        category: 'sadya',
      },
    ],
  },
  fusion_cross_cultural: {
    moduleTitle: 'Dual-Heritage & Inter-Faith Fusion Protocol Engine',
    moduleSubtitle: 'Bilingual vow ceremony, unity candle & sacred fire transition, and multicultural culinary coordination.',
    items: [
      {
        id: 'fc_1',
        title: 'Bilingual Vow Folios (Sanskrit Shlokas & English Vows)',
        description: 'Custom handcrafted vow books bound in ivory silk with parallel Sanskrit marriage mantras and personal couple vows.',
        quantity: '2 Deluxe Folios',
        leadPerson: 'Couple & Officiant',
        timing: '10:30 AM (Dual Altar)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'fc_2',
        title: 'Dual Altar Staging (Mandap Fire & Cathedral Aisle)',
        description: 'Unified stage with sacred Agni kunda on left and unity candle floral arbor on right with seamless transition.',
        quantity: '1 Unified Stage Layout',
        leadPerson: 'Stage Production Lead',
        timing: '09:00 AM',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'fc_3',
        title: 'East-Meets-West Melodic Fusion Acoustic Soundcheck',
        description: 'Sitar, Cello, Tabla, and acoustic guitar ensemble soundcheck balancing sacred ragas and contemporary orchestration.',
        quantity: '4-Piece Live Ensemble',
        leadPerson: 'Sound Engineer',
        timing: '09:30 AM (Sound Console)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'fc_4',
        title: 'Cultural Protocol Explanatory Cards for Guests',
        description: 'Bilingual illustrated cards on seats explaining the significance of 7 Pheras, Saptapadi, and Unity Candle rituals.',
        quantity: '200 Booklets',
        leadPerson: 'Usher Team Lead',
        timing: '10:00 AM (Guest Seating)',
        isCompleted: false,
        category: 'general',
      },
    ],
  },
  christian_western: {
    moduleTitle: 'Cathedral Solemnization & Black-Tie Protocol Engine',
    moduleSubtitle: 'Rehearsal walkthrough, processional order, exchange of rings, and cocktail hour quartet.',
    items: [
      {
        id: 'cw_1',
        title: 'Processional Lineup & Usher Briefing',
        description: 'Grandparents, parents, groomsmen, bridesmaids, ring bearer, flower girl, and bride entry timing.',
        quantity: 'Full Wedding Party',
        leadPerson: 'Wedding Director',
        timing: '10:30 AM (Narthex)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'cw_2',
        title: 'Sacred Rings & Platinum Vow Exchange',
        description: 'Best man holding platinum rings in velvet box; priest blessing and solemnization vows.',
        quantity: '1 Pair of Rings',
        leadPerson: 'Best Man & Priest',
        timing: '11:15 AM (Cathedral Altar)',
        isCompleted: false,
        category: 'general',
      },
      {
        id: 'cw_3',
        title: 'Sunset Cocktail Hour String Quartet',
        description: 'Live classical quartet playing contemporary love anthems on open-air terrace with champagne flutes.',
        quantity: '4 Musicians',
        leadPerson: 'Entertainment Director',
        timing: '05:30 PM (Terrace Pavilion)',
        isCompleted: false,
        category: 'general',
      },
    ],
  },
};

export const CulturalRitualProtocols: React.FC<CulturalRitualProtocolsProps> = ({
  culture,
  onAddBudgetItem,
  onAddTimelineEntry,
}) => {
  const [protocols, setProtocols] = useState<Record<WeddingCulture, ProtocolChecklistItem[]>>(() => {
    const saved = loadFromStorage<Record<WeddingCulture, ProtocolChecklistItem[]> | null>('cultural_protocols_map', null);
    if (saved && saved[culture]) {
      return saved;
    }
    const initialMap: Record<WeddingCulture, ProtocolChecklistItem[]> = {
      north_indian: DEFAULT_PROTOCOLS.north_indian.items,
      punjabi_sikh: DEFAULT_PROTOCOLS.punjabi_sikh.items,
      muslim_nikah: DEFAULT_PROTOCOLS.muslim_nikah.items,
      south_indian: DEFAULT_PROTOCOLS.south_indian.items,
      fusion_cross_cultural: DEFAULT_PROTOCOLS.fusion_cross_cultural.items,
      christian_western: DEFAULT_PROTOCOLS.christian_western.items,
    };
    return initialMap;
  });

  // Persist protocols on change
  useEffect(() => {
    saveToStorage('cultural_protocols_map', protocols);
  }, [protocols]);

  const activeModule = DEFAULT_PROTOCOLS[culture] || DEFAULT_PROTOCOLS.north_indian;
  const currentItems = protocols[culture] || activeModule.items;

  const completedCount = useMemo(() => {
    return currentItems.filter((it) => it.isCompleted).length;
  }, [currentItems]);

  const progressPercent = useMemo(() => {
    if (currentItems.length === 0) return 0;
    return Math.round((completedCount / currentItems.length) * 100);
  }, [completedCount, currentItems.length]);

  const handleToggle = (id: string) => {
    setProtocols((prev) => {
      const list = prev[culture] || activeModule.items;
      const updated = list.map((it) => {
        if (it.id === id) {
          const nextState = !it.isCompleted;
          if (nextState) {
            try {
              confetti({
                particleCount: 25,
                spread: 45,
                origin: { y: 0.7 },
                colors: ['#d4af37', '#f59e0b', '#ec4899'],
              });
            } catch {
              // fallback
            }
          }
          return { ...it, isCompleted: nextState };
        }
        return it;
      });
      return { ...prev, [culture]: updated };
    });
  };

  const handleInjectToTimeline = (item: ProtocolChecklistItem) => {
    if (!onAddTimelineEntry) return;
    onAddTimelineEntry({
      title: item.title,
      time: item.timing?.split('(')[0]?.trim() || '10:00 AM',
      durationMinutes: 45,
      owner: item.leadPerson || 'Priest Coordinator',
      location: item.timing?.split('(')[1]?.replace(')', '')?.trim() || 'Mandap / Altar',
      milestone: 'Ceremony',
      status: 'scheduled',
    });
  };

  const handleInjectToBudget = (item: ProtocolChecklistItem) => {
    if (!onAddBudgetItem) return;
    onAddBudgetItem({
      name: `${item.title} (Ritual Logistics)`,
      category: 'decor',
      estimatedCost: 350,
      actualCost: 0,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Panel with Progress Meter */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(20, 26, 43, 0.9) 0%, rgba(13, 17, 28, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.35)',
                }}
              >
                <Flame size={20} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                {activeModule.moduleTitle}
              </h3>
              <Badge variant="gold" size="sm">
                Live Cultural Protocol
              </Badge>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 0', maxWidth: '850px', lineHeight: 1.45 }}>
              {activeModule.moduleSubtitle}
            </p>
          </div>

          {/* Progress Tracker Ring / Stat */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Operational Readiness</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: progressPercent === 100 ? '#34d399' : '#fbbf24' }}>
                {progressPercent}% Complete
              </span>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: `conic-gradient(#f59e0b ${progressPercent * 3.6}deg, rgba(255, 255, 255, 0.1) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                }}
              >
                {completedCount}/{currentItems.length}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Progress Bar */}
        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6)',
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Protocol Checklist Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1rem',
        }}
      >
        {currentItems.map((item) => {
          return (
            <div
              key={item.id}
              className="glass-panel card-hover-lift"
              style={{
                padding: '1.2rem',
                borderRadius: '14px',
                backgroundColor: item.isCompleted ? 'rgba(16, 185, 129, 0.06)' : 'rgba(20, 26, 43, 0.75)',
                border: item.isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.isCompleted}
                    onClick={() => handleToggle(item.id)}
                    aria-label={`Toggle completion for ${item.title}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      textAlign: 'left',
                    }}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 size={20} color="#10b981" />
                    ) : (
                      <Circle size={20} color="#94a3b8" />
                    )}
                    <h4
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        color: item.isCompleted ? '#a7f3d0' : '#f8fafc',
                        margin: 0,
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </h4>
                  </button>

                  {item.quantity && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#fde047',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.quantity}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '0.82rem',
                    color: item.isCompleted ? '#6ee7b7' : '#94a3b8',
                    margin: '0.5rem 0 0 1.9rem',
                    lineHeight: 1.45,
                  }}
                >
                  {item.description}
                </p>
              </div>

              {/* Footer Metadata & Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '0.75rem',
                  fontSize: '0.74rem',
                  color: '#cbd5e1',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {item.leadPerson && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <User size={12} color="#38bdf8" />
                      <span>{item.leadPerson}</span>
                    </div>
                  )}
                  {item.timing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} color="#fbbf24" />
                      <span>{item.timing}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {onAddTimelineEntry && (
                    <button
                      type="button"
                      onClick={() => handleInjectToTimeline(item)}
                      title="Add this ritual to timeline schedule"
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#a5b4fc',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Timeline
                    </button>
                  )}
                  {onAddBudgetItem && (
                    <button
                      type="button"
                      onClick={() => handleInjectToBudget(item)}
                      title="Allocate decor/logistics budget for this item"
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(236, 72, 153, 0.15)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        color: '#f472b6',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Budget
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
