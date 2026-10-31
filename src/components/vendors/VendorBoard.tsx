import React, { useState } from 'react';
import type { VendorItem, VendorStatus, VendorCategory } from '../../types/vendor';
import { useVendorTracker } from '../../hooks/useVendorTracker';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { VendorModal } from './VendorModal';
import { createDefaultVendorsFromTemplate } from '../../data/vendorTemplates';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Mail,
  Phone,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Building,
  Utensils,
  Camera,
  Flower2,
  Music,
  Lightbulb,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface VendorBoardProps {
  vendors: VendorItem[];
  currency?: string;
  domain?: 'wedding' | 'birthday' | 'community';
  onUpdateVendors: (vendors: VendorItem[]) => void;
}

const KANBAN_COLUMNS: VendorStatus[] = [
  'Contacted',
  'Quote Received',
  'Contract Signed',
  'Deposit Paid',
  'Fully Paid',
];

export const VendorBoard: React.FC<VendorBoardProps> = ({
  vendors,
  currency = 'USD',
  domain = 'wedding',
  onUpdateVendors,
}) => {
  const {
    filter,
    setFilter,
    filteredVendors,
    addVendor,
    updateVendor,
    deleteVendor,
    advanceToNextStatus,
    transitionStatus,
  } = useVendorTracker({
    vendors,
    onUpdateVendors,
  });

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  // Screening Checklist Modal
  const [screeningVendor, setScreeningVendor] = useState<VendorItem | null>(null);
  const [screeningChecklist, setScreeningChecklist] = useState<Record<string, boolean>>({
    insurance: true,
    references: true,
    contractWaiver: true,
    safetyCompliance: true,
  });

  const getCategoryIcon = (cat: VendorCategory) => {
    switch (cat) {
      case 'Venue': return <Building size={16} color="#38bdf8" />;
      case 'Catering': return <Utensils size={16} color="#f59e0b" />;
      case 'Photography & Video': return <Camera size={16} color="#ec4899" />;
      case 'Decor & Florals': return <Flower2 size={16} color="#34d399" />;
      case 'Music & DJ': return <Music size={16} color="#818cf8" />;
      case 'Lighting & AV': return <Lightbulb size={16} color="#fcd34d" />;
      default: return <ShieldCheck size={16} color="#94a3b8" />;
    }
  };

  return (
    <section
      aria-label="Vendor Partner Management"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Top Banner & Action Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
            Vendor & Logistics Partner Board
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Track contracting pipeline from initial inquiry to full balance release.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Mode Switcher (Kanban vs Table) */}
          <div
            role="group"
            aria-label="View Switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              padding: '0.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              aria-pressed={viewMode === 'kanban'}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'kanban' ? '#6366f1' : 'transparent',
                color: viewMode === 'kanban' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#6366f1' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            id="btn-load-vendor-template"
            onClick={() => {
              const defaultTemplates = createDefaultVendorsFromTemplate(domain);
              onUpdateVendors([...vendors, ...defaultTemplates]);
            }}
            aria-label="Load per-event-type default vendor checklist templates"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>📋 Load {domain.charAt(0).toUpperCase() + domain.slice(1)} Template</span>
          </button>

          <button
            type="button"
            id="btn-add-vendor"
            className="btn-primary-glow"
            onClick={() => {
              setEditingVendor(null);
              setIsModalOpen(true);
            }}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
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
            <Plus size={16} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#090d16',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
            placeholder="Search vendor name, service, contact..."
            aria-label="Search vendors"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%',
            }}
          />
        </div>

        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value as VendorCategory | 'All' })}
          aria-label="Filter by vendor category"
          style={{
            backgroundColor: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        >
          <option value="All">All Categories</option>
          <option value="Venue">Venue</option>
          <option value="Catering">Catering</option>
          <option value="Photography & Video">Photography & Video</option>
          <option value="Decor & Florals">Decor & Florals</option>
          <option value="Music & DJ">Music & DJ</option>
          <option value="Lighting & AV">Lighting & AV</option>
          <option value="Officiant / MC">Officiant / MC</option>
          <option value="Security & Safety">Security & Safety</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* 1. Kanban Board View */}
      {viewMode === 'kanban' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {KANBAN_COLUMNS.map((colStatus) => {
            const colVendors = filteredVendors.filter((v) => v.status === colStatus);

            return (
              <div
                key={colStatus}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  minHeight: '380px',
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                      {colStatus}
                    </span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {colVendors.length}
                  </Badge>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colVendors.map((vendor, vIdx) => (
                    <article
                      key={vendor.id}
                      className={`glass-panel card-hover-lift animate-fade-in-up stagger-${(vIdx % 6) + 1}`}
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {getCategoryIcon(vendor.category)}
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                            {vendor.name}
                          </h4>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, lineHeight: 1.3 }}>
                        {vendor.service}
                      </p>

                      {/* Contact Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {vendor.email && (
                          <a href={`mailto:${vendor.email}`} style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Mail size={12} /> Email
                          </a>
                        )}
                        {vendor.phone && (
                          <a href={`tel:${vendor.phone}`} style={{ color: '#34d399', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Phone size={12} /> Call
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setScreeningVendor(vendor)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#a78bfa',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <FileCheck size={12} /> Screening
                        </button>
                      </div>

                      {/* Financial info */}
                      <div
                        style={{
                          backgroundColor: '#090d16',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                        }}
                      >
                        <span style={{ color: '#94a3b8' }}>Contract: {formatCurrency(vendor.contractAmount, currency)}</span>
                        <span style={{ color: vendor.balanceDue > 0 ? '#f59e0b' : '#34d399', fontWeight: 700 }}>
                          Bal: {formatCurrency(vendor.balanceDue, currency)}
                        </span>
                      </div>

                      {/* Advance action */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        {vendor.status !== 'Fully Paid' ? (
                          <button
                            type="button"
                            onClick={() => advanceToNextStatus(vendor.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#818cf8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              padding: 0,
                            }}
                          >
                            <span>Advance</span>
                            <ChevronRight size={13} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        )}

                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVendor(vendor);
                              setIsModalOpen(true);
                            }}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.25rem', color: '#cbd5e1', cursor: 'pointer' }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteVendor(vendor.id)}
                            style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', padding: '0.25rem', color: '#f87171', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Data Table View */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '0.75rem' }}>Vendor Name & Service</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Contact</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Contract Value</th>
                <th style={{ padding: '0.75rem' }}>Balance Due</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{vendor.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{vendor.service}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {getCategoryIcon(vendor.category)}
                      <span>{vendor.category}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                    <div style={{ color: '#cbd5e1' }}>{vendor.contactPerson}</div>
                    <div style={{ color: '#38bdf8' }}>{vendor.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select
                      value={vendor.status}
                      onChange={(e) => transitionStatus(vendor.id, e.target.value as VendorStatus)}
                      aria-label={`Change status for ${vendor.name}`}
                      style={{
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {KANBAN_COLUMNS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>
                    {formatCurrency(vendor.contractAmount, currency)}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: vendor.balanceDue > 0 ? '#f59e0b' : '#34d399' }}>
                    {formatCurrency(vendor.balanceDue, currency)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVendor(vendor);
                          setIsModalOpen(true);
                        }}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem', color: '#cbd5e1', cursor: 'pointer' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVendor(vendor.id)}
                        style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '0.3rem', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vendor Screening Checklist Modal */}
      {screeningVendor && (
        <Modal
          isOpen={true}
          onClose={() => setScreeningVendor(null)}
          title={`Screening & Compliance: ${screeningVendor.name}`}
          description="Logistics compliance and insurance verification prior to site arrival."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={screeningChecklist.insurance}
                onChange={(e) => setScreeningChecklist({ ...screeningChecklist, insurance: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
              />
              Commercial General Liability ($2M COI Filed)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={screeningChecklist.references}
                onChange={(e) => setScreeningChecklist({ ...screeningChecklist, references: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
              />
              Prior Event References & Portfolio Verified
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={screeningChecklist.contractWaiver}
                onChange={(e) => setScreeningChecklist({ ...screeningChecklist, contractWaiver: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
              />
              Signed Hold Harmless & Indemnity Agreement
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={screeningChecklist.safetyCompliance}
                onChange={(e) => setScreeningChecklist({ ...screeningChecklist, safetyCompliance: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
              />
              Site Load-In & Fire Safety Guidelines Acknowledged
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setScreeningVendor(null)}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close & Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(vendorData) => {
          if (editingVendor) {
            return updateVendor(editingVendor.id, vendorData);
          }
          return addVendor(vendorData);
        }}
        initialData={editingVendor}
      />
    </section>
  );
};
