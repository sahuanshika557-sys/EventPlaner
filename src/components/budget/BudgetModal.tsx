import React, { useState } from 'react';
import type { BudgetLineItem, BudgetCategory } from '../../types/budget';
import { Modal } from '../common/Modal';
import { validateNonNegativeNumber } from '../../utils/validators';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<BudgetLineItem, 'id'>) => { success: boolean; error?: string };
  initialData?: BudgetLineItem | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('venue');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [actualCost, setActualCost] = useState('0');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prevInitialData, setPrevInitialData] = useState<BudgetLineItem | null | undefined>(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setEstimatedCost(String(initialData.estimatedCost));
      setActualCost(String(initialData.actualCost));
      setIsPaid(initialData.isPaid);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setCategory('venue');
      setEstimatedCost('0');
      setActualCost('0');
      setIsPaid(false);
      setNotes('');
    }
    setErrorMessage(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide an item description or title.');
      return;
    }

    const validEst = validateNonNegativeNumber(estimatedCost, 'Estimated Cost');
    if (!validEst.valid) {
      setErrorMessage(validEst.error || 'Invalid estimated cost');
      return;
    }

    const validAct = validateNonNegativeNumber(actualCost, 'Actual Cost');
    if (!validAct.valid) {
      setErrorMessage(validAct.error || 'Invalid actual cost');
      return;
    }

    const res = onSubmit({
      name: name.trim(),
      category,
      estimatedCost: validEst.value,
      actualCost: validAct.value,
      isPaid,
      notes: notes.trim(),
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to save item.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget Line Item' : 'Add New Budget Item'}
      description="Track costs strictly categorized against your event financial matrix."
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

        <div>
          <label
            htmlFor="budget-name"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
          >
            Item Name / Description *
          </label>
          <input
            id="budget-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Grand Ballroom Audio Rig, Floral Centerpieces"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label
              htmlFor="budget-category"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Matrix Category *
            </label>
            <select
              id="budget-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as BudgetCategory)}
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
              <option value="venue">Venue & Facilities (35%)</option>
              <option value="catering">Catering & Beverages (30%)</option>
              <option value="decor">Decor & Florals (15%)</option>
              <option value="media">Media & Photography (10%)</option>
              <option value="contingency">Contingency Reserve (10%)</option>
              <option value="other">Other Miscellaneous</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="budget-estimated"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Estimated Cost *
            </label>
            <input
              id="budget-estimated"
              type="number"
              min="0"
              step="0.01"
              required
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label
              htmlFor="budget-actual"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
            >
              Actual Cost Incurred
            </label>
            <input
              id="budget-actual"
              type="number"
              min="0"
              step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
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

          <div style={{ paddingTop: '1.25rem' }}>
            <label
              htmlFor="budget-paid"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <input
                id="budget-paid"
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
              />
              Mark as fully paid
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="budget-notes"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}
          >
            Notes & Vendor Reference
          </label>
          <textarea
            id="budget-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contract terms, invoice #, payment link"
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
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            {initialData ? 'Update Item' : 'Save Line Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
