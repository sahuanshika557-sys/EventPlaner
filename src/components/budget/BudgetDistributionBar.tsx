import React from 'react';
import type { CategorySummary, BudgetCategory } from '../../types/budget';
import { RECOMMENDED_ALLOCATIONS } from '../../hooks/useBudgetCalculator';
import { formatCurrency } from '../../utils/currency';

interface BudgetDistributionBarProps {
  categories: CategorySummary[];
  totalSpent: number;
  totalBudget: number;
  percentSpent: number;
  currency?: string;
}

export const BudgetDistributionBar: React.FC<BudgetDistributionBarProps> = ({
  categories,
  totalSpent,
  totalBudget,
  percentSpent,
  currency = 'USD',
}) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Expenditure Distribution vs Target Breakdown
        </span>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Total Allocated: <strong style={{ color: '#f8fafc' }}>{formatCurrency(totalSpent, currency)}</strong> of {formatCurrency(totalBudget, currency)}
        </span>
      </div>

      {/* Stacked multi-color progress track */}
      <div
        role="progressbar"
        aria-label="Stacked category expenditure"
        aria-valuenow={percentSpent}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          height: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          display: 'flex',
          width: '100%',
        }}
      >
        {categories.map((cat) => {
          const widthPct = totalBudget > 0 ? (cat.actualSpent / totalBudget) * 100 : 0;
          if (widthPct <= 0) return null;
          return (
            <div
              key={cat.category}
              className="smooth-progress-bar"
              title={`${cat.name}: ${formatCurrency(cat.actualSpent, currency)} (${Math.round(widthPct)}%)`}
              style={{
                height: '100%',
                width: `${widthPct}%`,
                backgroundColor: RECOMMENDED_ALLOCATIONS[cat.category as BudgetCategory]?.color || '#8b5cf6',
                transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.85rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        {categories.map((cat) => (
          <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: RECOMMENDED_ALLOCATIONS[cat.category as BudgetCategory]?.color || '#8b5cf6',
              }}
            />
            <span>
              {cat.name} ({cat.targetPercent}% target)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
