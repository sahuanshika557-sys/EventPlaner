import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface BudgetAlertBannerProps {
  isOverBudget: boolean;
  percentSpent: number;
  totalSpent: number;
  totalBudget: number;
  remainingBudget: number;
  currency?: string;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  isOverBudget,
  percentSpent,
  totalSpent,
  totalBudget,
  remainingBudget,
  currency = 'USD',
}) => {
  return (
    <div aria-live="polite" role="status">
      {isOverBudget && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fca5a5',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.25)',
          }}
        >
          <ShieldAlert size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>CRITICAL OVER-BUDGET ALERT:</strong>{' '}
            Actual expenditure ({formatCurrency(totalSpent, currency)}) exceeds the total budget of{' '}
            {formatCurrency(totalBudget, currency)} by{' '}
            <span style={{ color: '#ffffff', fontWeight: 700 }}>
              {formatCurrency(Math.abs(remainingBudget), currency)}
            </span>
            . Immediate contingency release or expense reduction required.
          </div>
        </div>
      )}

      {!isOverBudget && percentSpent >= 90 && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fcd34d',
          }}
        >
          <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>BUDGET THRESHOLD WARNING:</strong>{' '}
            You have consumed {percentSpent}% of your total budget. Only{' '}
            {formatCurrency(remainingBudget, currency)} remains unallocated.
          </div>
        </div>
      )}
    </div>
  );
};
