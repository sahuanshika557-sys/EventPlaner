import React from 'react';
import { Gift, Plus, TrendingDown } from 'lucide-react';
import { Badge } from '../common/Badge';
import type { StructuredEventPlan } from '../../services/aiService';

interface ReturnGiftsCardProps {
  returnGifts: StructuredEventPlan['returnGifts'];
  budgetOptimizations?: string[];
  guestCount: number;
  onAddBudgetItem?: (item: {
    name: string;
    category: 'venue' | 'catering' | 'decor' | 'media' | 'contingency' | 'other';
    estimatedCost: number;
    actualCost: number;
  }) => void;
  onSetToastMessage: (msg: string) => void;
}

export const ReturnGiftsCard: React.FC<ReturnGiftsCardProps> = ({
  returnGifts,
  budgetOptimizations,
  guestCount,
  onAddBudgetItem,
  onSetToastMessage,
}) => {
  return (
    <article
      className="glass-panel card-hover-lift animate-fade-in-up stagger-5"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gift size={20} color="#a78bfa" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            5. Return Gifts & Keepsakes
          </h4>
        </div>
        <Badge variant="neutral" size="sm">
          {returnGifts.length} Keepsakes
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {returnGifts.map((gift, gIdx) => (
          <div
            key={gIdx}
            style={{
              backgroundColor: '#090d16',
              padding: '0.85rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{gift.itemName}</strong>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.82rem' }}>
                ~${gift.estimatedUnitCost}/unit
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>
              For: {gift.recipientGroup}
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
              {gift.description}
            </p>

            {onAddBudgetItem && (
              <button
                type="button"
                onClick={() => {
                  const totalFavors = Math.round(guestCount * gift.estimatedUnitCost);
                  onAddBudgetItem({
                    name: `${gift.itemName} (${gift.recipientGroup})`,
                    category: 'other',
                    estimatedCost: totalFavors,
                    actualCost: totalFavors,
                  });
                  onSetToastMessage(`Added "${gift.itemName}" to Budget!`);
                  setTimeout(() => onSetToastMessage(''), 2500);
                }}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '0.35rem',
                  padding: '0.25rem 0.6rem',
                  backgroundColor: 'rgba(167, 139, 250, 0.12)',
                  border: '1px solid rgba(167, 139, 250, 0.35)',
                  borderRadius: '6px',
                  color: '#c4b5fd',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Plus size={12} /> Add Favors to Budget
              </button>
            )}
          </div>
        ))}
      </div>

      {/* GenAI Budget Optimization Tips */}
      {budgetOptimizations && budgetOptimizations.length > 0 && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#fde68a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <TrendingDown size={14} color="#f59e0b" />
            <span>GenAI Budget Optimization Advice:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.45 }}>
            {budgetOptimizations.map((tip, tIdx) => (
              <li key={tIdx} style={{ marginBottom: '0.2rem' }}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
};

