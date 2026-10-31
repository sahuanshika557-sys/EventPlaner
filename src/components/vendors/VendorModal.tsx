import React, { useState } from 'react';
import type { VendorItem, VendorCategory, VendorStatus } from '../../types/vendor';
import { Modal } from '../common/Modal';
import { validateNonNegativeNumber, validateEmail, validatePhone } from '../../utils/validators';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendor: Omit<VendorItem, 'id' | 'balanceDue'>) => { success: boolean; error?: string };
  initialData?: VendorItem | null;
}

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Venue');
  const [service, setService] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<VendorStatus>('Contacted');
  const [contractAmount, setContractAmount] = useState('0');
  const [depositPaid, setDepositPaid] = useState('0');
  const [balanceDueDate, setBalanceDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prevInitialData, setPrevInitialData] = useState<VendorItem | null | undefined>(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setService(initialData.service);
      setContactPerson(initialData.contactPerson);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setStatus(initialData.status);
      setContractAmount(String(initialData.contractAmount));
      setDepositPaid(String(initialData.depositPaid));
      setBalanceDueDate(initialData.balanceDueDate || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setCategory('Venue');
      setService('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setStatus('Contacted');
      setContractAmount('0');
      setDepositPaid('0');
      setBalanceDueDate('');
      setNotes('');
    }
    setErrorMessage(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Vendor organization name is required.');
      return;
    }

    if (!service.trim()) {
      setErrorMessage('Service description is required.');
      return;
    }

    if (email && !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (phone && !validatePhone(phone)) {
      setErrorMessage('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    const validContract = validateNonNegativeNumber(contractAmount, 'Contract Amount');
    if (!validContract.valid) {
      setErrorMessage(validContract.error || 'Invalid contract amount.');
      return;
    }

    const validDeposit = validateNonNegativeNumber(depositPaid, 'Deposit Paid');
    if (!validDeposit.valid) {
      setErrorMessage(validDeposit.error || 'Invalid deposit amount.');
      return;
    }

    if (validDeposit.value > validContract.value) {
      setErrorMessage('Deposit paid cannot exceed total contract value.');
      return;
    }

    const res = onSubmit({
      name: name.trim(),
      category,
      service: service.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      contractAmount: validContract.value,
      depositPaid: validDeposit.value,
      balanceDueDate: balanceDueDate.trim() || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to save vendor details.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Vendor Profile' : 'Add New Vendor Partner'}
      description="Track contracting status, payment milestones, and direct communication points."
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              fontSize: '0.875rem',
            }}
          >
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label
              htmlFor="vendor-name"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Vendor Business Name *
            </label>
            <input
              id="vendor-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Heritage Caterers"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="vendor-category"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Vendor Category *
            </label>
            <select
              id="vendor-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VendorCategory)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
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
        </div>

        <div>
          <label
            htmlFor="vendor-service"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
          >
            Scope of Service / Deliverables *
          </label>
          <input
            id="vendor-service"
            type="text"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. 5-course banquet with live tandoor and beverage service"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#0f1322',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label
              htmlFor="vendor-contact"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Contact Person
            </label>
            <input
              id="vendor-contact"
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Samantha Vance"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="vendor-email"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Email Address
            </label>
            <input
              id="vendor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="samantha@vendor.com"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="vendor-phone"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Phone Number
            </label>
            <input
              id="vendor-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label
              htmlFor="vendor-status"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Current Status *
            </label>
            <select
              id="vendor-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="Contacted">Contacted</option>
              <option value="Quote Received">Quote Received</option>
              <option value="Contract Signed">Contract Signed</option>
              <option value="Deposit Paid">Deposit Paid</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="vendor-contract"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Contract Value ($)
            </label>
            <input
              id="vendor-contract"
              type="number"
              min="0"
              step="0.01"
              value={contractAmount}
              onChange={(e) => setContractAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="vendor-deposit"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Deposit Paid ($)
            </label>
            <input
              id="vendor-deposit"
              type="number"
              min="0"
              step="0.01"
              value={depositPaid}
              onChange={(e) => setDepositPaid(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#0f1322',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="vendor-due-date"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
          >
            Balance Due Date
          </label>
          <input
            id="vendor-due-date"
            type="date"
            value={balanceDueDate}
            onChange={(e) => setBalanceDueDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#0f1322',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="vendor-notes"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
          >
            Logistics & Contract Notes
          </label>
          <textarea
            id="vendor-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Load-in times, power requirements, parking access"
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#0f1322',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '0.65rem 1.5rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {initialData ? 'Update Vendor' : 'Save Vendor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
