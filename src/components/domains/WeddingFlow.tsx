import React, { useState, useMemo, useCallback } from 'react';
import type {
  WeddingCulture,
  WeddingScheduleDay,
  GuestRsvpItem,
  TableSeatingItem,
  BridalPartyMember,
  RsvpStatus,
  DietaryRestriction,
  GuestSide,
  BridalPartyRole,
} from '../../types/wedding';
import type { BudgetCategory } from '../../types/budget';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { sanitizeInput } from '../../utils/sanitizer';
import { CULTURAL_TRADITION_PRESETS, getCulturalPreset } from '../../data/culturalTraditions';
import { CulturalRitualProtocols } from './CulturalRitualProtocols';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  Plus,
  Car,
  Crown,
  Search,
  Download,
  AlertTriangle,
  Trash2,
  Check,
  Phone,
  Flame,
  CheckSquare,
} from 'lucide-react';

interface WeddingFlowProps {
  scheduleDays: WeddingScheduleDay[];
  guests: GuestRsvpItem[];
  tables: TableSeatingItem[];
  bridalParty: BridalPartyMember[];
  culture?: WeddingCulture;
  onUpdateScheduleDays: (days: WeddingScheduleDay[]) => void;
  onUpdateGuests: (guests: GuestRsvpItem[]) => void;
  onUpdateTables: (tables: TableSeatingItem[]) => void;
  onUpdateBridalParty: (bridalParty: BridalPartyMember[]) => void;
  onUpdateCulture?: (culture: WeddingCulture) => void;
  onAddBudgetItem?: (item: { name: string; category: BudgetCategory; estimatedCost: number; actualCost: number }) => void;
  onAddTimelineEntry?: (entry: { time: string; durationMinutes: number; title: string; owner: string; location: string; milestone: string; status: 'scheduled' }) => void;
}

export const WeddingFlow: React.FC<WeddingFlowProps> = ({
  scheduleDays,
  guests,
  tables,
  bridalParty,
  culture = 'north_indian',
  onUpdateScheduleDays,
  onUpdateGuests,
  onUpdateTables,
  onUpdateBridalParty,
  onUpdateCulture,
  onAddBudgetItem,
  onAddTimelineEntry,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'schedule' | 'rsvp' | 'seating' | 'bridal' | 'rituals'>('schedule');
  const [cultureChangeNotification, setCultureChangeNotification] = useState<string | null>(null);

  // 1. Cultural Cascading Switcher
  const handleSelectCulture = (selectedCulture: WeddingCulture) => {
    if (onUpdateCulture) {
      onUpdateCulture(selectedCulture);
    }
    const preset = getCulturalPreset(selectedCulture);
    onUpdateScheduleDays(preset.ceremonies);
    setCultureChangeNotification(
      `Switched to ${preset.displayName}: Regenerated ${preset.ceremonies.length} authentic ritual ceremonies with Muhurtham time slots!`
    );
    setTimeout(() => {
      setCultureChangeNotification(null);
    }, 4500);
  };

  const activePreset = getCulturalPreset(culture);

  // 2. Add Ceremony Day Modal State
  const [isCeremonyModalOpen, setIsCeremonyModalOpen] = useState(false);
  const [ceremonyName, setCeremonyName] = useState('');
  const [ceremonyDate, setCeremonyDate] = useState('2026-11-20');
  const [ceremonyStartTime, setCeremonyStartTime] = useState('10:00 AM');
  const [ceremonyEndTime, setCeremonyEndTime] = useState('02:00 PM');
  const [ceremonyMuhurtham, setCeremonyMuhurtham] = useState('');
  const [ceremonyVenue, setCeremonyVenue] = useState('');
  const [ceremonyAttire, setCeremonyAttire] = useState('');
  const [ceremonyDietaryRule, setCeremonyDietaryRule] = useState('Pure Vegetarian & Jain Options');
  const [ceremonyRitualTags, setCeremonyRitualTags] = useState('');
  const [ceremonyPujaItems, setCeremonyPujaItems] = useState('');
  const [ceremonyNotes, setCeremonyNotes] = useState('');

  const handleAddCeremony = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!ceremonyName.trim()) return;

    const tagsArray = ceremonyRitualTags
      .split(',')
      .map((t) => sanitizeInput(t.trim()))
      .filter(Boolean);

    const pujaArray = ceremonyPujaItems
      .split(',')
      .map((p) => sanitizeInput(p.trim()))
      .filter(Boolean);

    const newDay: WeddingScheduleDay = {
      id: `ceremony_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: sanitizeInput(ceremonyName.trim()),
      date: sanitizeInput(ceremonyDate.trim() || '2026-11-20'),
      startTime: sanitizeInput(ceremonyStartTime.trim() || '10:00 AM'),
      endTime: sanitizeInput(ceremonyEndTime.trim() || '02:00 PM'),
      muhurthamTiming: ceremonyMuhurtham.trim() ? sanitizeInput(ceremonyMuhurtham.trim()) : undefined,
      venue: sanitizeInput(ceremonyVenue.trim() || 'Grand Heritage Palace'),
      attireCode: sanitizeInput(ceremonyAttire.trim() || activePreset.defaultAttire),
      dietaryRule: sanitizeInput(ceremonyDietaryRule.trim() || activePreset.dietaryPreset),
      ritualTags: tagsArray.length > 0 ? tagsArray : ['Traditional Ceremony'],
      pujaItems: pujaArray.length > 0 ? pujaArray : ['Floral Garlands', 'Blessing Prasad'],
      ritualNotes: sanitizeInput(ceremonyNotes.trim() || 'Sacred ceremony rites and family blessings.'),
    };

    onUpdateScheduleDays([...scheduleDays, newDay]);
    setIsCeremonyModalOpen(false);
    setCeremonyName('');
    setCeremonyMuhurtham('');
    setCeremonyVenue('');
    setCeremonyAttire('');
    setCeremonyRitualTags('');
    setCeremonyPujaItems('');
    setCeremonyNotes('');
  }, [
    ceremonyName,
    ceremonyRitualTags,
    ceremonyPujaItems,
    ceremonyDate,
    ceremonyStartTime,
    ceremonyEndTime,
    ceremonyMuhurtham,
    ceremonyVenue,
    ceremonyAttire,
    activePreset.defaultAttire,
    ceremonyDietaryRule,
    activePreset.dietaryPreset,
    ceremonyNotes,
    onUpdateScheduleDays,
    scheduleDays,
  ]);

  const handleDeleteCeremony = (dayId: string) => {
    onUpdateScheduleDays(scheduleDays.filter((d) => d.id !== dayId));
  };

  // 3. Guest RSVP Tracker State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestRsvp, setGuestRsvp] = useState<RsvpStatus>('Attending');
  const [guestSide, setGuestSide] = useState<GuestSide>('Bride');
  const [guestDiet, setGuestDiet] = useState<DietaryRestriction>('None');
  const [guestPlusOne, setGuestPlusOne] = useState(0);
  const [guestIsVip, setGuestIsVip] = useState(false);
  const [guestNotes, setGuestNotes] = useState('');

  // Filters for Guest RSVP
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpFilterStatus, setRsvpFilterStatus] = useState<string>('All');
  const [rsvpFilterDiet, setRsvpFilterDiet] = useState<string>('All');
  const [rsvpFilterSide, setRsvpFilterSide] = useState<string>('All');

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        !rsvpSearch ||
        g.fullName.toLowerCase().includes(rsvpSearch.toLowerCase()) ||
        (g.notes && g.notes.toLowerCase().includes(rsvpSearch.toLowerCase())) ||
        g.email.toLowerCase().includes(rsvpSearch.toLowerCase());

      const matchStatus = rsvpFilterStatus === 'All' || g.rsvpStatus === rsvpFilterStatus;
      const matchDiet = rsvpFilterDiet === 'All' || g.dietaryRestriction === rsvpFilterDiet;
      const matchSide = rsvpFilterSide === 'All' || (g.side || 'Mutual') === rsvpFilterSide;

      return matchSearch && matchStatus && matchDiet && matchSide;
    });
  }, [guests, rsvpSearch, rsvpFilterStatus, rsvpFilterDiet, rsvpFilterSide]);

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newGuest: GuestRsvpItem = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: sanitizeInput(guestName.trim()),
      email: sanitizeInput(guestEmail.trim()),
      phone: sanitizeInput(guestPhone.trim()),
      rsvpStatus: guestRsvp,
      side: guestSide,
      dietaryRestriction: guestDiet,
      plusOneCount: Math.max(0, Number(guestPlusOne) || 0),
      isVip: guestIsVip,
      notes: sanitizeInput(guestNotes.trim()),
    };

    onUpdateGuests([...guests, newGuest]);
    setIsGuestModalOpen(false);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setGuestDiet('None');
    setGuestSide('Bride');
    setGuestPlusOne(0);
    setGuestIsVip(false);
    setGuestNotes('');
  };

  const handleToggleGuestStatus = (guestId: string) => {
    const nextStatus: Record<RsvpStatus, RsvpStatus> = {
      Attending: 'Pending',
      Pending: 'Declined',
      Declined: 'Attending',
    };

    const updated = guests.map((g) => {
      if (g.id !== guestId) return g;
      const newStatus = nextStatus[g.rsvpStatus];
      // If changed to declined, remove from table
      if (newStatus === 'Declined' && g.tableId) {
        handleAssignGuestToTable(g.id, '');
      }
      return { ...g, rsvpStatus: newStatus };
    });
    onUpdateGuests(updated);
  };

  const handleDeleteGuest = (guestId: string) => {
    handleAssignGuestToTable(guestId, '');
    onUpdateGuests(guests.filter((g) => g.id !== guestId));
  };

  // CSV Export for Guest Master List
  const handleExportGuestsCSV = () => {
    const headers = ['Full Name', 'RSVP Status', 'Side', 'Dietary Preference', 'Plus Ones', 'Table Assignment', 'VIP', 'Phone', 'Email', 'Notes'];
    const rows = guests.map((g) => {
      const table = tables.find((t) => t.id === g.tableId);
      const tableName = table ? `Table ${table.tableNumber} - ${table.tableName}` : 'Unassigned';
      return [
        `"${g.fullName.replace(/"/g, '""')}"`,
        `"${g.rsvpStatus}"`,
        `"${g.side || 'Mutual'}"`,
        `"${g.dietaryRestriction}"`,
        g.plusOneCount,
        `"${tableName.replace(/"/g, '""')}"`,
        g.isVip ? 'Yes' : 'No',
        `"${(g.phone || '').replace(/"/g, '""')}"`,
        `"${(g.email || '').replace(/"/g, '""')}"`,
        `"${(g.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Wedding_Guest_RSVP_Master_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 4. Table Seating State & Handlers
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<number>(() => tables.length + 1);
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState<number>(10);
  const [tableShape, setTableShape] = useState<'Round' | 'Rectangular' | 'Square'>('Round');
  const [tableIsVip, setTableIsVip] = useState(false);

  const handleAssignGuestToTable = (guestId: string, tableId: string) => {
    // Remove from previous table
    const updatedTables = tables.map((tbl) => ({
      ...tbl,
      assignedGuestIds: tbl.assignedGuestIds.filter((id) => id !== guestId),
    }));

    // Add to target table if specified
    if (tableId) {
      const target = updatedTables.find((t) => t.id === tableId);
      if (target && !target.assignedGuestIds.includes(guestId)) {
        target.assignedGuestIds.push(guestId);
      }
    }

    onUpdateTables(updatedTables);

    // Update guest's tableId
    const updatedGuests = guests.map((g) =>
      g.id === guestId ? { ...g, tableId: tableId || undefined } : g
    );
    onUpdateGuests(updatedGuests);
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    const safeCapacity = Math.max(1, Math.min(50, Number(tableCapacity) || 8));
    const safeNumber = Number(tableNumber) || (tables.length + 1);

    const newTable: TableSeatingItem = {
      id: `tbl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tableNumber: safeNumber,
      tableName: sanitizeInput(tableName.trim() || `Table ${safeNumber}`),
      capacity: safeCapacity,
      shape: tableShape,
      isVip: tableIsVip,
      assignedGuestIds: [],
    };

    onUpdateTables([...tables, newTable]);
    setIsTableModalOpen(false);
    setTableName('');
    setTableCapacity(10);
    setTableIsVip(false);
    setTableNumber(tables.length + 2);
  };

  const handleDeleteTable = (tableId: string) => {
    // Unassign all guests at this table
    const updatedGuests = guests.map((g) =>
      g.tableId === tableId ? { ...g, tableId: undefined } : g
    );
    onUpdateGuests(updatedGuests);
    onUpdateTables(tables.filter((t) => t.id !== tableId));
  };

  // 5. Bridal Party & Cultural Logistics State
  const [isBridalModalOpen, setIsBridalModalOpen] = useState(false);
  const [bridalName, setBridalName] = useState('');
  const [bridalRole, setBridalRole] = useState<BridalPartyRole>('Pandit / Officiant Coordinator');
  const [bridalPhone, setBridalPhone] = useState('');
  const [bridalCallTime, setBridalCallTime] = useState('08:00 AM');
  const [bridalHairSlot, setBridalHairSlot] = useState('09:00 AM');
  const [bridalRoom, setBridalRoom] = useState('Suite 401 (Bridal Sanctuary)');
  const [bridalTransport, setBridalTransport] = useState('Mercedes Sprinter Van 1');

  const handleAddBridalMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bridalName.trim()) return;

    const newMember: BridalPartyMember = {
      id: `bp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: sanitizeInput(bridalName.trim()),
      role: bridalRole,
      phone: sanitizeInput(bridalPhone.trim()),
      callTime: sanitizeInput(bridalCallTime.trim()),
      hairMakeupSlot: sanitizeInput(bridalHairSlot.trim()),
      dressingRoom: sanitizeInput(bridalRoom.trim()),
      assignedTransport: sanitizeInput(bridalTransport.trim()),
      isReady: false,
    };

    onUpdateBridalParty([...bridalParty, newMember]);
    setIsBridalModalOpen(false);
    setBridalName('');
    setBridalPhone('');
  };

  const handleToggleBridalReady = (id: string) => {
    const updated = bridalParty.map((bp) =>
      bp.id === id ? { ...bp, isReady: !bp.isReady } : bp
    );
    onUpdateBridalParty(updated);
  };

  const handleDeleteBridalMember = (id: string) => {
    onUpdateBridalParty(bridalParty.filter((bp) => bp.id !== id));
  };

  // Aggregated RSVP stats
  const totalAttending = guests
    .filter((g) => g.rsvpStatus === 'Attending')
    .reduce((sum, g) => sum + 1 + (g.plusOneCount || 0), 0);

  const totalDeclined = guests.filter((g) => g.rsvpStatus === 'Declined').length;
  const totalPending = guests.filter((g) => g.rsvpStatus === 'Pending').length;
  const unassignedAttendingGuests = guests.filter((g) => g.rsvpStatus === 'Attending' && !g.tableId);

  // Side breakdowns
  const brideSideCount = guests.filter((g) => (g.side || 'Bride') === 'Bride' && g.rsvpStatus === 'Attending').length;
  const groomSideCount = guests.filter((g) => g.side === 'Groom' && g.rsvpStatus === 'Attending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Dynamic Cultural Archetype Selector Bar */}
      <section
        aria-label="Cultural Wedding Tradition Selector"
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '18px',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          background: 'linear-gradient(135deg, rgba(20, 26, 43, 0.85) 0%, rgba(13, 17, 28, 0.95) 100%)',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{activePreset.icon}</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                Wedding Culture & Tradition Architecture
              </h2>
              <Badge variant="gold" size="sm">
                Active: {activePreset.displayName}
              </Badge>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              Select a cultural archetype to cascade authentic multi-day rituals, Muhurtham slots, puja samagri, and dietary protocols.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              {scheduleDays.length} Ritual Days • {activePreset.musicPreset.split('&')[0]}
            </span>
          </div>
        </div>

        {/* 6 Cultural Archetype Cards */}
        <div
          role="radiogroup"
          aria-label="Cultural Archetypes"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {Object.values(CULTURAL_TRADITION_PRESETS).map((preset) => {
            const isSelected = culture === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectCulture(preset.id)}
                className="btn-glass-glow card-hover-lift"
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: isSelected
                    ? '2px solid #d4af37'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(99, 102, 241, 0.15))'
                    : 'rgba(255, 255, 255, 0.03)',
                  boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '1.25rem' }}>{preset.icon}</span>
                  {isSelected && (
                    <span
                      style={{
                        backgroundColor: '#d4af37',
                        color: '#0f172a',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                      }}
                    >
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <strong style={{ fontSize: '0.88rem', color: isSelected ? '#fde047' : '#f8fafc' }}>
                  {preset.displayName}
                </strong>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.25',
                  }}
                >
                  {preset.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Culture Specs Bar */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
            <Sparkles size={14} color="#ec4899" />
            <span>Recommended Attire: <strong style={{ color: '#f8fafc' }}>{activePreset.defaultAttire}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
            <Flame size={14} color="#f59e0b" />
            <span>Ritual Soundtrack: <strong style={{ color: '#f8fafc' }}>{activePreset.musicPreset}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1' }}>
            <CheckSquare size={14} color="#10b981" />
            <span>Dietary Rule: <strong style={{ color: '#f8fafc' }}>{activePreset.dietaryPreset}</strong></span>
          </div>
        </div>

        {/* Culture Cascaded Toast Notice */}
        {cultureChangeNotification && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <CheckCircle2 size={15} />
            <span>{cultureChangeNotification}</span>
          </div>
        )}
      </section>

      {/* Sub-navigation for Wedding flows */}
      <div
        role="tablist"
        aria-label="Wedding Flow Sections"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(26, 31, 48, 0.65)',
          padding: '0.4rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSubSection === 'schedule'}
          onClick={() => setActiveSubSection('schedule')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeSubSection === 'schedule' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: activeSubSection === 'schedule' ? '#ffffff' : '#94a3b8',
            background: activeSubSection === 'schedule' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
          }}
        >
          <Calendar size={15} />
          <span>Multi-Day Scheduling ({scheduleDays.length} Days)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubSection === 'rsvp'}
          onClick={() => setActiveSubSection('rsvp')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeSubSection === 'rsvp' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: activeSubSection === 'rsvp' ? '#ffffff' : '#94a3b8',
            background: activeSubSection === 'rsvp' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
          }}
        >
          <Users size={15} />
          <span>Guest RSVP Tracker ({totalAttending} Confirmed)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubSection === 'seating'}
          onClick={() => setActiveSubSection('seating')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeSubSection === 'seating' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: activeSubSection === 'seating' ? '#ffffff' : '#94a3b8',
            background: activeSubSection === 'seating' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
          }}
        >
          <Crown size={15} />
          <span>Table Seating ({tables.length} Tables)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubSection === 'bridal'}
          onClick={() => setActiveSubSection('bridal')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeSubSection === 'bridal' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: activeSubSection === 'bridal' ? '#ffffff' : '#94a3b8',
            background: activeSubSection === 'bridal' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
          }}
        >
          <Sparkles size={15} />
          <span>Bridal Party & Logistics ({bridalParty.length} Assigned)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubSection === 'rituals'}
          onClick={() => setActiveSubSection('rituals')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeSubSection === 'rituals' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: activeSubSection === 'rituals' ? '#ffffff' : '#fde047',
            background: activeSubSection === 'rituals' ? 'linear-gradient(135deg, #d4af37, #b45309)' : 'rgba(212, 175, 55, 0.1)',
            borderLeft: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <Flame size={15} color={activeSubSection === 'rituals' ? '#ffffff' : '#f59e0b'} />
          <span>Rituals & Cultural Protocols</span>
        </button>
      </div>

      {/* 1. Multi-Day Wedding Ceremonies & Sequence */}
      {activeSubSection === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Multi-Day Wedding Ceremonies & Sequence
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    color: '#fde047',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                  }}
                >
                  {activePreset.displayName}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Authentic cultural rites, auspicious Muhurtham timeframes, dress codes, puja samagri, and dietary rules.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary-glow"
              onClick={() => setIsCeremonyModalOpen(true)}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Plus size={15} /> Add Ceremony Day
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {scheduleDays.map((day, idx) => (
              <article
                key={day.id}
                className={`glass-panel card-hover-lift animate-fade-in-up stagger-${(idx % 6) + 1}`}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  border: day.muhurthamTiming ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {day.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>{day.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {day.muhurthamTiming && (
                      <Badge variant="gold" size="sm" icon={<Clock size={11} />}>
                        Muhurtham
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCeremony(day.id)}
                      title="Delete ceremony"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        borderRadius: '4px',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Timing & Venue */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={14} color="#38bdf8" />
                    <span>
                      {day.startTime} – {day.endTime}
                      {day.muhurthamTiming && (
                        <strong style={{ color: '#fde047', marginLeft: '0.4rem' }}>
                          ({day.muhurthamTiming})
                        </strong>
                      )}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={14} color="#34d399" />
                    <span>{day.venue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={14} color="#ec4899" />
                    <span>Attire Code: <strong style={{ color: '#f8fafc' }}>{day.attireCode}</strong></span>
                  </div>
                </div>

                {/* Ritual Tags */}
                {day.ritualTags && day.ritualTags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {day.ritualTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ritual Highlights */}
                <div
                  style={{
                    backgroundColor: '#0f1322',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <strong style={{ color: '#cbd5e1' }}>Rituals & Highlights:</strong> {day.ritualNotes}
                </div>

                {/* Puja Items & Dietary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
                  {day.pujaItems && day.pujaItems.length > 0 && (
                    <div style={{ color: '#fde047', display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
                      <span style={{ fontWeight: 700 }}>Puja Samagri:</span>
                      <span style={{ color: '#cbd5e1' }}>{day.pujaItems.join(', ')}</span>
                    </div>
                  )}
                  {day.dietaryRule && (
                    <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontWeight: 700 }}>Dietary Rule:</span>
                      <span style={{ color: '#cbd5e1' }}>{day.dietaryRule}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 2. Guest RSVP Tracker View */}
      {activeSubSection === 'rsvp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(26, 31, 48, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Attending Headcount</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>{totalAttending}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bride: {brideSideCount} • Groom: {groomSideCount}</span>
            </div>
            <div style={{ backgroundColor: 'rgba(26, 31, 48, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pending Responses</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>{totalPending}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Awaiting reply</span>
            </div>
            <div style={{ backgroundColor: 'rgba(26, 31, 48, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Declined With Regrets</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>{totalDeclined}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Blessing notes received</span>
            </div>
            <div style={{ backgroundColor: 'rgba(26, 31, 48, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Unassigned Seating</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8', marginTop: '0.2rem' }}>{unassignedAttendingGuests.length}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Require table allocation</span>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Guest Master List, Dietary Rules & Side Tracker
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                  Search by guest name, toggle status in-line, filter by dietary requirements (Jain/Halal/Veg), and export to CSV.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={handleExportGuestsCSV}
                  className="btn-glass-glow"
                  style={{
                    padding: '0.5rem 0.9rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Download size={14} color="#38bdf8" /> Export RSVP CSV
                </button>

                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Plus size={15} /> Add Guest
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                backgroundColor: '#0f1322',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#64748b" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search guest name or note..."
                  value={rsvpSearch}
                  onChange={(e) => setRsvpSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem 0.45rem 2rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <select
                  aria-label="Filter by RSVP status"
                  value={rsvpFilterStatus}
                  onChange={(e) => setRsvpFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="All">All Statuses ({guests.length})</option>
                  <option value="Attending">Attending</option>
                  <option value="Pending">Pending</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div>
                <select
                  aria-label="Filter by side"
                  value={rsvpFilterSide}
                  onChange={(e) => setRsvpFilterSide(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="All">All Family Sides</option>
                  <option value="Bride">Bride's Side</option>
                  <option value="Groom">Groom's Side</option>
                  <option value="Mutual">Mutual Friends</option>
                </select>
              </div>

              <div>
                <select
                  aria-label="Filter by dietary preference"
                  value={rsvpFilterDiet}
                  onChange={(e) => setRsvpFilterDiet(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="All">All Dietary Protocols</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Jain">Jain (Strict No Root Veg)</option>
                  <option value="Halal">Halal Certified</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Kosher">Kosher</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="None">Standard / None</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Guest Name</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Side</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>RSVP Status</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Dietary Protocol</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Plus-Ones</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>Table Assignment</th>
                    <th style={{ padding: '0.65rem 0.75rem' }}>VIP</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        No guests found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => {
                      const sideLabel = g.side || 'Mutual';
                      const sideColor = sideLabel === 'Bride' ? '#ec4899' : sideLabel === 'Groom' ? '#3b82f6' : '#8b5cf6';

                      return (
                        <tr key={g.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                            <div>{g.fullName}</div>
                            {g.notes && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{g.notes}</div>}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: `${sideColor}22`,
                                color: sideColor,
                                border: `1px solid ${sideColor}44`,
                              }}
                            >
                              {sideLabel}'s Side
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleGuestStatus(g.id)}
                              title="Click to toggle status (Attending -> Pending -> Declined)"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Badge
                                variant={
                                  g.rsvpStatus === 'Attending'
                                    ? 'success'
                                    : g.rsvpStatus === 'Pending'
                                    ? 'warning'
                                    : 'danger'
                                }
                                size="sm"
                              >
                                {g.rsvpStatus}
                              </Badge>
                            </button>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <Badge
                              variant={
                                g.dietaryRestriction === 'Jain'
                                  ? 'gold'
                                  : g.dietaryRestriction === 'Halal'
                                  ? 'info'
                                  : g.dietaryRestriction === 'Vegetarian'
                                  ? 'success'
                                  : g.dietaryRestriction === 'None'
                                  ? 'neutral'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {g.dietaryRestriction}
                            </Badge>
                          </td>
                          <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                            +{g.plusOneCount}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={g.tableId || ''}
                              onChange={(e) => handleAssignGuestToTable(g.id, e.target.value)}
                              aria-label={`Table assignment for ${g.fullName}`}
                              style={{
                                backgroundColor: '#0f1322',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                maxWidth: '180px',
                              }}
                            >
                              <option value="">-- Unassigned --</option>
                              {tables.map((t) => (
                                <option key={t.id} value={t.id}>
                                  Table {t.tableNumber}: {t.tableName} ({t.assignedGuestIds.length}/{t.capacity})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            {g.isVip ? (
                              <Badge variant="gold" size="sm" icon={<Crown size={11} />}>
                                VIP
                              </Badge>
                            ) : (
                              <span style={{ color: '#64748b' }}>Standard</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteGuest(g.id)}
                              title="Delete guest"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                padding: '0.2rem',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Table Seating Layout View */}
      {activeSubSection === 'seating' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                Banquet Floorplan & Table Seating
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Manage seating allocations with max-capacity warning indicators and quick unassigned guest allocation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTableModalOpen(true)}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Plus size={15} /> Add Table
            </button>
          </div>

          {/* Tables Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {tables.map((tbl) => {
              const seatedGuests = guests.filter((g) => tbl.assignedGuestIds.includes(g.id));
              const isOverCapacity = seatedGuests.length > tbl.capacity;
              const isFull = seatedGuests.length === tbl.capacity;
              const remainingSeats = Math.max(0, tbl.capacity - seatedGuests.length);

              return (
                <div
                  key={tbl.id}
                  style={{
                    backgroundColor: 'rgba(26, 31, 48, 0.65)',
                    borderRadius: '16px',
                    border: isOverCapacity
                      ? '2px solid #ef4444'
                      : tbl.isVip
                      ? '1px solid rgba(212, 175, 55, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    boxShadow: isOverCapacity ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: tbl.isVip ? 'rgba(212, 175, 55, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: tbl.isVip ? '#d4af37' : '#818cf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                        }}
                      >
                        {tbl.tableNumber}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                        {tbl.tableName}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {tbl.isVip && (
                        <Badge variant="gold" size="sm" icon={<Crown size={10} />}>
                          VIP
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteTable(tbl.id)}
                        title="Delete table"
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Capacity status indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#94a3b8' }}>Shape: {tbl.shape}</span>
                    {isOverCapacity ? (
                      <Badge variant="danger" size="sm" icon={<AlertTriangle size={11} />}>
                        Capacity Exceeded (+{seatedGuests.length - tbl.capacity})
                      </Badge>
                    ) : isFull ? (
                      <Badge variant="warning" size="sm">
                        At Full Capacity
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        {remainingSeats} Seats Available
                      </Badge>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (seatedGuests.length / tbl.capacity) * 100)}%`,
                        height: '100%',
                        backgroundColor: isOverCapacity ? '#ef4444' : isFull ? '#fbbf24' : '#34d399',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Seated Guests List */}
                  <div
                    style={{
                      backgroundColor: '#0f1322',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    {seatedGuests.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                        No guests assigned to this table yet.
                      </span>
                    ) : (
                      seatedGuests.map((sg) => (
                        <div
                          key={sg.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            color: '#cbd5e1',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{sg.fullName}</span>
                            {sg.dietaryRestriction !== 'None' && (
                              <span style={{ fontSize: '0.68rem', color: '#d4af37' }}>({sg.dietaryRestriction})</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAssignGuestToTable(sg.id, '')}
                            title="Remove from table"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f87171',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick-assign unassigned guest dropdown */}
                  {unassignedAttendingGuests.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <select
                        aria-label={`Assign guest to ${tbl.tableName}`}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignGuestToTable(e.target.value, tbl.id);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#cbd5e1',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                        }}
                      >
                        <option value="" disabled>
                          + Quick Assign Unassigned Guest...
                        </option>
                        {unassignedAttendingGuests.map((ug) => (
                          <option key={ug.id} value={ug.id}>
                            {ug.fullName} ({ug.side || 'Bride'}, {ug.dietaryRestriction})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Bridal Party Logistics View */}
      {activeSubSection === 'bridal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                Bridal Party, Cultural VIP Roles & Fleet Logistics
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Pandit/Officiant coordinator, Safa tying lead, Dhol captain, Trousseau custodian, and hair/makeup slots.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBridalModalOpen(true)}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Plus size={15} /> Add Party Member
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {bridalParty.map((bp) => (
              <article
                key={bp.id}
                style={{
                  backgroundColor: 'rgba(26, 31, 48, 0.65)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {bp.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: 600 }}>{bp.role}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleBridalReady(bp.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <Badge variant={bp.isReady ? 'success' : 'neutral'} size="sm" icon={<CheckCircle2 size={12} />}>
                        {bp.isReady ? 'Ready & Dressed' : 'In Prep'}
                      </Badge>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBridalMember(bp.id)}
                      title="Delete member"
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {bp.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={13} color="#34d399" />
                      <span>Contact: <strong style={{ color: '#ffffff' }}>{bp.phone}</strong></span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} color="#38bdf8" />
                    <span>Call Time: <strong style={{ color: '#ffffff' }}>{bp.callTime}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={13} color="#ec4899" />
                    <span>Hair & Makeup Slot: <strong style={{ color: '#ffffff' }}>{bp.hairMakeupSlot}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={13} color="#f59e0b" />
                    <span>Dressing Room: {bp.dressingRoom}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Car size={13} color="#10b981" />
                    <span>Assigned Transport: {bp.assignedTransport}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 5. Cultural Rituals & Protocols Checklist */}
      {activeSubSection === 'rituals' && (
        <CulturalRitualProtocols
          culture={culture}
          onAddBudgetItem={onAddBudgetItem}
          onAddTimelineEntry={onAddTimelineEntry}
        />
      )}

      {/* Modal 1: Add Custom Ceremony Day */}
      <Modal
        isOpen={isCeremonyModalOpen}
        onClose={() => setIsCeremonyModalOpen(false)}
        title="Add Custom Ceremony Day"
        description="Configure ceremony name, timing, auspicious Muhurtham window, venue, attire, ritual tags, and dietary rules."
      >
        <form onSubmit={handleAddCeremony} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="ceremony-name" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Ceremony Name *
            </label>
            <input
              id="ceremony-name"
              type="text"
              required
              value={ceremonyName}
              onChange={(e) => setCeremonyName(e.target.value)}
              placeholder="e.g. Saptapadi & Mangalya Dharanam"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="ceremony-date" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Date *
              </label>
              <input
                id="ceremony-date"
                type="date"
                required
                value={ceremonyDate}
                onChange={(e) => setCeremonyDate(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="ceremony-muhurtham" style={{ display: 'block', fontSize: '0.85rem', color: '#fde047', fontWeight: 600, marginBottom: '0.3rem' }}>
                Auspicious Muhurtham Timing
              </label>
              <input
                id="ceremony-muhurtham"
                type="text"
                value={ceremonyMuhurtham}
                onChange={(e) => setCeremonyMuhurtham(e.target.value)}
                placeholder="e.g. 09:15 AM - 10:45 AM (Brahma Muhurta)"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="ceremony-start" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Start Time
              </label>
              <input
                id="ceremony-start"
                type="text"
                value={ceremonyStartTime}
                onChange={(e) => setCeremonyStartTime(e.target.value)}
                placeholder="10:00 AM"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="ceremony-end" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                End Time
              </label>
              <input
                id="ceremony-end"
                type="text"
                value={ceremonyEndTime}
                onChange={(e) => setCeremonyEndTime(e.target.value)}
                placeholder="02:00 PM"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="ceremony-venue" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Venue / Hall
              </label>
              <input
                id="ceremony-venue"
                type="text"
                value={ceremonyVenue}
                onChange={(e) => setCeremonyVenue(e.target.value)}
                placeholder="e.g. Mandap by the Lotus Pond"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="ceremony-attire" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Attire Code
              </label>
              <input
                id="ceremony-attire"
                type="text"
                value={ceremonyAttire}
                onChange={(e) => setCeremonyAttire(e.target.value)}
                placeholder="e.g. Kanjeevaram Silk & Veshti"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="ceremony-diet" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Dietary Rule Protocol
              </label>
              <select
                id="ceremony-diet"
                value={ceremonyDietaryRule}
                onChange={(e) => setCeremonyDietaryRule(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Pure Vegetarian & Jain Options Available">Pure Vegetarian & Jain Options</option>
                <option value="Sattvic Traditional (No Onion / Garlic)">Sattvic (No Onion/Garlic)</option>
                <option value="Halal Certified Gourmet Feast">Halal Certified Feast</option>
                <option value="Kosher Style Catering">Kosher Style Catering</option>
                <option value="Multi-Cuisine Royal Banquet">Multi-Cuisine Royal Banquet</option>
              </select>
            </div>
            <div>
              <label htmlFor="ceremony-tags" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Ritual Tags (comma separated)
              </label>
              <input
                id="ceremony-tags"
                type="text"
                value={ceremonyRitualTags}
                onChange={(e) => setCeremonyRitualTags(e.target.value)}
                placeholder="e.g. KashiYatra, Oonjal, ThaliKettu"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ceremony-puja" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Puja Samagri / Ritual Items (comma separated)
            </label>
            <input
              id="ceremony-puja"
              type="text"
              value={ceremonyPujaItems}
              onChange={(e) => setCeremonyPujaItems(e.target.value)}
              placeholder="e.g. Coconuts, Sacred Yellow Thread, Turmeric, Brass Deepam"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label htmlFor="ceremony-notes" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Ritual Sequence & Highlights
            </label>
            <textarea
              id="ceremony-notes"
              rows={2}
              value={ceremonyNotes}
              onChange={(e) => setCeremonyNotes(e.target.value)}
              placeholder="Key ritual actions, officiant notes, guest blessings..."
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsCeremonyModalOpen(false)}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Add Ceremony Day
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Guest Modal */}
      <Modal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title="Add New Wedding Guest"
        description="Register guest attendance, family side (Bride/Groom), dietary preferences, and plus-one allowances."
      >
        <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="g-name" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Full Name *
            </label>
            <input
              id="g-name"
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Sunita & Rajesh Aggarwal"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="g-side" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Family Side *
              </label>
              <select
                id="g-side"
                value={guestSide}
                onChange={(e) => setGuestSide(e.target.value as GuestSide)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Bride">Bride's Side</option>
                <option value="Groom">Groom's Side</option>
                <option value="Mutual">Mutual Friends</option>
              </select>
            </div>
            <div>
              <label htmlFor="g-rsvp" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                RSVP Status
              </label>
              <select
                id="g-rsvp"
                value={guestRsvp}
                onChange={(e) => setGuestRsvp(e.target.value as RsvpStatus)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Attending">Attending</option>
                <option value="Pending">Pending</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="g-diet" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Dietary Restriction
              </label>
              <select
                id="g-diet"
                value={guestDiet}
                onChange={(e) => setGuestDiet(e.target.value as DietaryRestriction)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="None">None / Standard</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Jain">Jain (Strict No Root Veg)</option>
                <option value="Halal">Halal</option>
                <option value="Vegan">Vegan</option>
                <option value="Kosher">Kosher</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Nut Allergy">Nut Allergy</option>
                <option value="Dairy-Free">Dairy-Free</option>
              </select>
            </div>

            <div>
              <label htmlFor="g-plus" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Plus-One Allowance
              </label>
              <input
                id="g-plus"
                type="number"
                min="0"
                max="5"
                value={guestPlusOne}
                onChange={(e) => setGuestPlusOne(parseInt(e.target.value, 10) || 0)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="g-email" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Email
              </label>
              <input
                id="g-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@example.com"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label htmlFor="g-phone" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Phone Number
              </label>
              <input
                id="g-phone"
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+1 555-0199"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <input
              id="g-vip"
              type="checkbox"
              checked={guestIsVip}
              onChange={(e) => setGuestIsVip(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#d4af37' }}
            />
            <label htmlFor="g-vip" style={{ fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
              Mark as VIP Family / Head Table Guest
            </label>
          </div>

          <div>
            <label htmlFor="g-notes" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Special Notes / Seating Requests
            </label>
            <input
              id="g-notes"
              type="text"
              value={guestNotes}
              onChange={(e) => setGuestNotes(e.target.value)}
              placeholder="e.g. Wheelchair access needed, Bride's aunt"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsGuestModalOpen(false)}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Register Guest
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Add Table Modal */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="Add Banquet Table"
        description="Configure table number, name, seating capacity, and VIP designation."
      >
        <form onSubmit={handleAddTable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label htmlFor="tbl-num" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Table # *
              </label>
              <input
                id="tbl-num"
                type="number"
                min="1"
                required
                value={tableNumber}
                onChange={(e) => setTableNumber(parseInt(e.target.value, 10) || 1)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="tbl-name" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Table Name / Theme *
              </label>
              <input
                id="tbl-name"
                type="text"
                required
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. Royal Peacock VIP Lounge"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="tbl-cap" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Maximum Capacity *
              </label>
              <input
                id="tbl-cap"
                type="number"
                min="1"
                max="50"
                required
                value={tableCapacity}
                onChange={(e) => setTableCapacity(parseInt(e.target.value, 10) || 8)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="tbl-shape" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Table Geometry
              </label>
              <select
                id="tbl-shape"
                value={tableShape}
                onChange={(e) => setTableShape(e.target.value as 'Round' | 'Rectangular' | 'Square')}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Round">Round (Banquet)</option>
                <option value="Rectangular">Rectangular (Family Long)</option>
                <option value="Square">Square</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <input
              id="tbl-vip"
              type="checkbox"
              checked={tableIsVip}
              onChange={(e) => setTableIsVip(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#d4af37' }}
            />
            <label htmlFor="tbl-vip" style={{ fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
              Designate as VIP Head Table (Gold Highlight & Priority Service)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsTableModalOpen(false)}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Add Table
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Add Bridal Party / Logistics Member */}
      <Modal
        isOpen={isBridalModalOpen}
        onClose={() => setIsBridalModalOpen(false)}
        title="Add Bridal Party & Logistics Member"
        description="Assign cultural coordinators, safa masters, bridal retinue, call times, and assigned fleet transport."
      >
        <form onSubmit={handleAddBridalMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="bp-name" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Full Name *
            </label>
            <input
              id="bp-name"
              type="text"
              required
              value={bridalName}
              onChange={(e) => setBridalName(e.target.value)}
              placeholder="e.g. Pandit Rakesh Shastri"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="bp-role" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Cultural Role / Assignment *
              </label>
              <select
                id="bp-role"
                value={bridalRole}
                onChange={(e) => setBridalRole(e.target.value as BridalPartyRole)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Pandit / Officiant Coordinator">Pandit / Officiant Coordinator</option>
                <option value="Safa & Turban Tying Lead">Safa & Turban Tying Lead</option>
                <option value="Dhol & Procession Captain">Dhol & Procession Captain</option>
                <option value="Trousseau & Jewelry Custodian">Trousseau & Jewelry Custodian</option>
                <option value="Fleet & Transport Manager">Fleet & Transport Manager</option>
                <option value="Nikah Registrar & Vakil">Nikah Registrar & Vakil</option>
                <option value="Maid of Honor">Maid of Honor</option>
                <option value="Best Man">Best Man</option>
                <option value="Bridesmaid">Bridesmaid</option>
                <option value="Groomsman">Groomsman</option>
                <option value="Parent">Parent / Elder</option>
                <option value="Flower Girl / Ring Bearer">Flower Girl / Ring Bearer</option>
              </select>
            </div>
            <div>
              <label htmlFor="bp-phone" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Emergency Contact Phone
              </label>
              <input
                id="bp-phone"
                type="tel"
                value={bridalPhone}
                onChange={(e) => setBridalPhone(e.target.value)}
                placeholder="+1 555-7799"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="bp-call" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Call Time
              </label>
              <input
                id="bp-call"
                type="text"
                value={bridalCallTime}
                onChange={(e) => setBridalCallTime(e.target.value)}
                placeholder="07:30 AM"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="bp-hair" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Hair & Makeup Slot
              </label>
              <input
                id="bp-hair"
                type="text"
                value={bridalHairSlot}
                onChange={(e) => setBridalHairSlot(e.target.value)}
                placeholder="08:30 AM"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="bp-room" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Dressing Room / Suite
              </label>
              <input
                id="bp-room"
                type="text"
                value={bridalRoom}
                onChange={(e) => setBridalRoom(e.target.value)}
                placeholder="Suite 401 (Bridal)"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="bp-trans" style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Assigned Fleet Transport
              </label>
              <input
                id="bp-trans"
                type="text"
                value={bridalTransport}
                onChange={(e) => setBridalTransport(e.target.value)}
                placeholder="Mercedes Sprinter 1"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsBridalModalOpen(false)}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Assign Role
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
