import React, { useState } from 'react';
import type {
  PublicSpacePermitItem,
  SafetyChecklistItem,
  VolunteerShiftItem,
  CrowdSafetyProtocol,
  PermitStatus,
} from '../../types/community';
import { Badge, type BadgeVariant } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  FileCheck2,
  ShieldCheck,
  Users2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Volume2,
  PhoneCall,
  Flame,
} from 'lucide-react';

interface CommunityFlowProps {
  permits: PublicSpacePermitItem[];
  safetyChecklist: SafetyChecklistItem[];
  volunteerShifts: VolunteerShiftItem[];
  crowdSafety: CrowdSafetyProtocol;
  onUpdatePermits: (permits: PublicSpacePermitItem[]) => void;
  onUpdateSafetyChecklist: (checklist: SafetyChecklistItem[]) => void;
  onUpdateVolunteerShifts: (shifts: VolunteerShiftItem[]) => void;
  onUpdateCrowdSafety: (updates: Partial<CrowdSafetyProtocol>) => void;
}

const PERMIT_STATUS_VARIANTS: Record<PermitStatus, BadgeVariant> = {
  Draft: 'neutral',
  Submitted: 'info',
  'Under Review': 'warning',
  Approved: 'success',
  'Renewal Required': 'danger',
};

const SAFETY_STATUS_VARIANTS: Record<SafetyChecklistItem['status'], BadgeVariant> = {
  Pass: 'success',
  'Attention Needed': 'danger',
  Pending: 'warning',
};

export const CommunityFlow: React.FC<CommunityFlowProps> = ({
  permits,
  safetyChecklist,
  volunteerShifts,
  crowdSafety,
  onUpdatePermits,
  onUpdateSafetyChecklist,
  onUpdateVolunteerShifts,
  onUpdateCrowdSafety,
}) => {
  const [subSection, setSubSection] = useState<'permits' | 'safety' | 'volunteers' | 'crowd'>('permits');

  // Permit Modal state
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [permitType, setPermitType] = useState<PublicSpacePermitItem['permitType']>('Park / Public Ground');
  const [permitNumber, setPermitNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [submissionDate] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<PermitStatus>('Approved');
  const [expirationDate] = useState('');
  const [permitCost, setPermitCost] = useState('500');
  const [contactOfficer, setContactOfficer] = useState('');

  // Volunteer Modal state
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerRole, setVolunteerRole] = useState<VolunteerShiftItem['role']>('Registration & Check-in');
  const [volunteerShift, setVolunteerShift] = useState<VolunteerShiftItem['shiftBlock']>('Morning (08:00 - 12:00)');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [volunteerNotes, setVolunteerNotes] = useState('');

  const handleToggleSafetyInspection = (id: string) => {
    const updated = safetyChecklist.map((sc) => {
      if (sc.id !== id) return sc;
      const nextStatus = sc.status === 'Pass' ? 'Attention Needed' : sc.status === 'Attention Needed' ? 'Pending' : 'Pass';
      return {
        ...sc,
        isInspected: nextStatus === 'Pass',
        status: nextStatus as SafetyChecklistItem['status'],
      };
    });
    onUpdateSafetyChecklist(updated);
  };

  const handleToggleVolunteerCheckIn = (id: string) => {
    const updated = volunteerShifts.map((vs) =>
      vs.id === id ? { ...vs, isCheckedIn: !vs.isCheckedIn } : vs
    );
    onUpdateVolunteerShifts(updated);
  };

  const handleAddPermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitNumber.trim()) return;

    const newPermit: PublicSpacePermitItem = {
      id: `p_${Date.now()}`,
      permitType,
      permitNumber: permitNumber.trim(),
      issuingAuthority: issuingAuthority.trim() || 'Municipal Authority',
      submissionDate: submissionDate || new Date().toISOString().split('T')[0],
      approvalStatus,
      expirationDate: expirationDate || '2026-10-31',
      cost: parseFloat(permitCost) || 0,
      contactOfficer: contactOfficer.trim() || 'Duty Officer',
    };

    onUpdatePermits([...permits, newPermit]);
    setIsPermitModalOpen(false);
    setPermitNumber('');
    setIssuingAuthority('');
    setContactOfficer('');
  };

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName.trim()) return;

    const newVol: VolunteerShiftItem = {
      id: `vol_${Date.now()}`,
      volunteerName: volunteerName.trim(),
      role: volunteerRole,
      shiftBlock: volunteerShift,
      phone: volunteerPhone.trim(),
      emergencyContact: emergencyContact.trim(),
      isCheckedIn: false,
      notes: volunteerNotes.trim(),
    };

    onUpdateVolunteerShifts([...volunteerShifts, newVol]);
    setIsVolunteerModalOpen(false);
    setVolunteerName('');
    setVolunteerPhone('');
    setEmergencyContact('');
    setVolunteerNotes('');
  };

  const checkedInCount = volunteerShifts.filter((v) => v.isCheckedIn).length;
  const passedInspections = safetyChecklist.filter((s) => s.status === 'Pass').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub Navigation */}
      <div
        role="tablist"
        aria-label="Community Event Flow Sections"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(26, 31, 48, 0.65)',
          padding: '0.4rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={subSection === 'permits'}
          onClick={() => setSubSection('permits')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: subSection === 'permits' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: subSection === 'permits' ? '#ffffff' : '#94a3b8',
            background: subSection === 'permits' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
          }}
        >
          <FileCheck2 size={15} />
          <span>Public Space Permits ({permits.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subSection === 'safety'}
          onClick={() => setSubSection('safety')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: subSection === 'safety' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: subSection === 'safety' ? '#ffffff' : '#94a3b8',
            background: subSection === 'safety' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
          }}
        >
          <ShieldCheck size={15} />
          <span>Safety & First-Aid ({passedInspections}/{safetyChecklist.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subSection === 'volunteers'}
          onClick={() => setSubSection('volunteers')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: subSection === 'volunteers' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: subSection === 'volunteers' ? '#ffffff' : '#94a3b8',
            background: subSection === 'volunteers' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
          }}
        >
          <Users2 size={15} />
          <span>Volunteer Shift Manager ({checkedInCount}/{volunteerShifts.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subSection === 'crowd'}
          onClick={() => setSubSection('crowd')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: subSection === 'crowd' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: subSection === 'crowd' ? '#ffffff' : '#94a3b8',
            background: subSection === 'crowd' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
          }}
        >
          <AlertTriangle size={15} />
          <span>Crowd Safety & Decibels</span>
        </button>
      </div>

      {/* 1. Public Space Permits */}
      {subSection === 'permits' && (
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
                Municipal Permits & Regulatory Filings
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Park usage, amplified sound limits, food truck health codes, and street closure orders.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary-glow"
              onClick={() => setIsPermitModalOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #059669, #10b981)',
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
              <Plus size={15} /> Add Permit Application
            </button>
          </div>

          {/* Municipal Regulatory Clearance Summary Checklist */}
          <div
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'linear-gradient(135deg, rgba(20, 26, 43, 0.8), rgba(15, 23, 42, 0.9))',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                Municipal Regulatory & Public Safety Filings Checklist
              </span>
              <Badge variant="success" size="sm">
                4 / 4 Core Permits Compliant
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.6rem' }}>
              {[
                { title: 'Fire Safety & Pyrotechnics', status: 'Approved', icon: <Flame size={13} color="#f59e0b" />, code: 'FIR-2026-9041' },
                { title: 'Sound Decibel Level (85 dB Cap)', status: 'Approved', icon: <Volume2 size={13} color="#38bdf8" />, code: 'SND-2026-1184' },
                { title: 'Police Clearance & Traffic Control', status: 'Approved', icon: <ShieldCheck size={13} color="#10b981" />, code: 'POL-2026-5502' },
                { title: 'Health Dept & Vendor Food Hygiene', status: 'Approved', icon: <CheckCircle2 size={13} color="#ec4899" />, code: 'HLT-2026-8830' },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    backgroundColor: '#0f1322',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {item.icon}
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>{item.title}</span>
                  </div>
                  <Badge variant="success" size="sm">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {permits.map((p, idx) => (
              <article
                key={p.id}
                className={`glass-panel card-hover-lift animate-fade-in-up stagger-${(idx % 6) + 1}`}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.2rem 0' }}>
                      {p.permitType}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                      No: {p.permitNumber}
                    </span>
                  </div>
                  <Badge variant={PERMIT_STATUS_VARIANTS[p.approvalStatus]} size="sm">
                    {p.approvalStatus}
                  </Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <div>Authority: <strong style={{ color: '#ffffff' }}>{p.issuingAuthority}</strong></div>
                  <div>Officer: {p.contactOfficer}</div>
                  <div>Submitted: {p.submissionDate} • Expires: {p.expirationDate}</div>
                  <div>Permit Fee: ${p.cost.toFixed(2)}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 2. Safety & First-Aid Checklist */}
      {subSection === 'safety' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
              Safety, First-Aid & Hazard Prevention Checklist
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Physical site inspection compliance. Click status to cycle inspection outcome.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {safetyChecklist.map((item) => (
              <article
                key={item.id}
                style={{
                  backgroundColor: 'rgba(26, 31, 48, 0.65)',
                  borderRadius: '14px',
                  border: item.status === 'Pass' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="neutral" size="sm">
                      {item.category}
                    </Badge>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {item.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                    <span>Station: {item.stationLocation}</span>
                    <span>Inspector: {item.inspectorName}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSafetyInspection(item.id)}
                  aria-label={`Cycle status for ${item.title}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Badge variant={SAFETY_STATUS_VARIANTS[item.status]} size="md">
                    {item.status}
                  </Badge>
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 3. Volunteer Shift Manager */}
      {subSection === 'volunteers' && (
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
                Volunteer Shift Allocation & Real-Time Roster
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Track marshalls, eco-teams, registration desks, and shift check-in statuses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsVolunteerModalOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #059669, #10b981)',
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
              <Plus size={15} /> Add Volunteer
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {volunteerShifts.map((vol) => (
              <article
                key={vol.id}
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
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.2rem 0' }}>
                      {vol.volunteerName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>{vol.role}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleVolunteerCheckIn(vol.id)}
                    aria-label={`Toggle check-in for ${vol.volunteerName}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Badge variant={vol.isCheckedIn ? 'success' : 'neutral'} size="sm" icon={<CheckCircle2 size={12} />}>
                      {vol.isCheckedIn ? 'On Duty' : 'Not Checked-In'}
                    </Badge>
                  </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <div>Shift: <strong style={{ color: '#ffffff' }}>{vol.shiftBlock}</strong></div>
                  <div>Phone: {vol.phone}</div>
                  <div>Emergency Contact: {vol.emergencyContact}</div>
                  {vol.notes && <div style={{ color: '#94a3b8', marginTop: '0.2rem' }}>Notes: {vol.notes}</div>}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* 4. Crowd Safety & Decibels */}
      {subSection === 'crowd' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(26, 31, 48, 0.7)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Attendance / Capacity</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                {crowdSafety.currentEstimatedAttendance} / {crowdSafety.maxCapacityThreshold}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
                {Math.round((crowdSafety.currentEstimatedAttendance / crowdSafety.maxCapacityThreshold) * 100)}% capacity threshold
              </span>
            </div>

            <div style={{ backgroundColor: 'rgba(26, 31, 48, 0.7)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Sound Level (dB)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: crowdSafety.currentDecibelLevel > crowdSafety.decibelMonitoringLimitDb ? '#f87171' : '#38bdf8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Volume2 size={24} /> {crowdSafety.currentDecibelLevel} dB
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Permit Limit: {crowdSafety.decibelMonitoringLimitDb} dB
              </span>
            </div>

            <div style={{ backgroundColor: 'rgba(26, 31, 48, 0.7)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Density Heat Alert</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '0.5rem' }}>
                {crowdSafety.densityAlertLevel}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Continuous park sensor grid</span>
                <button
                  type="button"
                  onClick={() => onUpdateCrowdSafety({ currentEstimatedAttendance: Math.min(crowdSafety.maxCapacityThreshold, crowdSafety.currentEstimatedAttendance + 15) })}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    color: '#818cf8',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    padding: '0.15rem 0.4rem',
                  }}
                >
                  Sync Sensors
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Ingress, Egress & Evacuation Protocols
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Designated Access Corridors:</strong>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                {crowdSafety.ingressEgressPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: '#0f1322', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#38bdf8' }}>Evacuation Summary:</strong> {crowdSafety.evacuationRoutesSummary}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              <strong>Lost & Found Command:</strong> {crowdSafety.lostAndFoundLocation}
            </div>
          </div>

          {/* Interactive First-Aid & Medical Response Command Map */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(26, 31, 48, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  🚨 Emergency First-Aid Response & Tactical Field Map
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                  On-site triage stations, AED defibrillators, dedicated paramedic dispatch corridor, and doctor-on-call hotline.
                </p>
              </div>
              <Badge variant="danger" size="sm" icon={<PhoneCall size={11} />}>
                Paramedic Dispatch: +1 (555) 911-COMM
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.85rem' }}>
              {[
                {
                  code: 'Station Alpha (North Gate)',
                  role: 'Paramedic Ambulance Bay & Triage Base',
                  staff: 'Lead EMT Officer Martinez + 2 Paramedics',
                  gear: 'Oxygen cylinders, spine board, cardiac monitor',
                  status: 'Active & Staffed',
                  color: '#ef4444',
                },
                {
                  code: 'Station Beta (Central Lawn)',
                  role: 'Mobile First-Aid & Rapid Hydration Tent',
                  staff: 'Nurse Practitioner Clara & 3 Red Cross Volunteers',
                  gear: 'Heat exhaustion cots, electrolyte stations, burn care',
                  status: 'Active & Staffed',
                  color: '#f59e0b',
                },
                {
                  code: 'Station Gamma (Pavilion Stage)',
                  role: 'Automated External Defibrillator (AED) Post',
                  staff: 'Stage Security Captain & Certified CPR Crew',
                  gear: 'Wall-mounted Zoll AED, trauma kit, eye-wash',
                  status: 'Ready & Inspected',
                  color: '#10b981',
                },
                {
                  code: 'Station Delta (South Egress)',
                  role: 'Lost Children & Information Command Post',
                  staff: 'Volunteer Coordinator Dave + Park Ranger',
                  gear: 'Radio base station, wristband reuniting system',
                  status: 'Active & Staffed',
                  color: '#38bdf8',
                },
              ].map((st) => (
                <div
                  key={st.code}
                  style={{
                    backgroundColor: '#0f1322',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: `1px solid ${st.color}44`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: st.color }}>
                      {st.code}
                    </span>
                    <Badge variant="success" size="sm">
                      {st.status}
                    </Badge>
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{st.role}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <span style={{ color: '#94a3b8' }}>Staffing: </span>{st.staff}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    <span style={{ color: '#64748b' }}>Gear: </span>{st.gear}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Permit Modal */}
      <Modal
        isOpen={isPermitModalOpen}
        onClose={() => setIsPermitModalOpen(false)}
        title="Lodge Public Space Permit"
        description="Record regulatory permit number and issuing authority."
      >
        <form onSubmit={handleAddPermit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Permit Classification *
            </label>
            <select
              value={permitType}
              onChange={(e) => setPermitType(e.target.value as PublicSpacePermitItem['permitType'])}
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            >
              <option value="Park / Public Ground">Park / Public Ground Use</option>
              <option value="Sound & Amplification">Sound & Amplification</option>
              <option value="Food Vendor & Health">Food Vendor & Health Inspection</option>
              <option value="Street Closure / Traffic">Street Closure / Traffic Control</option>
              <option value="Special Event / Alcohol">Special Event / Alcohol Service</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Permit Number *
              </label>
              <input
                type="text"
                required
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value)}
                placeholder="e.g. PRK-2026-9041"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Issuing Authority
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. City Parks Dept"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Approval Status
              </label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as PermitStatus)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Renewal Required">Renewal Required</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Permit Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={permitCost}
                onChange={(e) => setPermitCost(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsPermitModalOpen(false)}
              style={{ padding: '0.6rem 1.25rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Save Permit
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Volunteer Modal */}
      <Modal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        title="Register Community Volunteer"
        description="Assign shift blocks and contact points."
      >
        <form onSubmit={handleAddVolunteer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
              Volunteer Full Name *
            </label>
            <input
              type="text"
              required
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              placeholder="e.g. Jessica Morales"
              style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Role
              </label>
              <select
                value={volunteerRole}
                onChange={(e) => setVolunteerRole(e.target.value as VolunteerShiftItem['role'])}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Registration & Check-in">Registration & Check-in</option>
                <option value="Crowd Marshall">Crowd Marshall</option>
                <option value="Information Desk">Information Desk</option>
                <option value="Waste Management / Eco">Waste Management / Eco</option>
                <option value="First Aid Support">First Aid Support</option>
                <option value="Stage Logistics">Stage Logistics</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Shift Block
              </label>
              <select
                value={volunteerShift}
                onChange={(e) => setVolunteerShift(e.target.value as VolunteerShiftItem['shiftBlock'])}
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              >
                <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                <option value="Evening (16:00 - 20:00)">Evening (16:00 - 20:00)</option>
                <option value="Breakdown / Night (20:00 - 23:00)">Breakdown / Night (20:00 - 23:00)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Mobile Phone
              </label>
              <input
                type="tel"
                value={volunteerPhone}
                onChange={(e) => setVolunteerPhone(e.target.value)}
                placeholder="+1 555-4401"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                Emergency Contact
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name & Phone"
                style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0f1322', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsVolunteerModalOpen(false)}
              style={{ padding: '0.6rem 1.25rem', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              Register Volunteer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
