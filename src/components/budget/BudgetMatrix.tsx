import React, { useState, useMemo } from 'react';
import type { BudgetLineItem, BudgetCategory } from '../../types/budget';
import { useBudgetCalculator, RECOMMENDED_ALLOCATIONS } from '../../hooks/useBudgetCalculator';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../common/Badge';
import { BudgetModal } from './BudgetModal';
import { BudgetAlertBanner } from './BudgetAlertBanner';
import { BudgetDistributionBar } from './BudgetDistributionBar';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BudgetMatrixProps {
  totalBudget: number;
  items: BudgetLineItem[];
  currency: string;
  onUpdateItems: (items: BudgetLineItem[]) => void;
  onUpdateBudget: (budget: number) => void;
  onUpdateCurrency: (curr: string) => void;
}

export const BudgetMatrix: React.FC<BudgetMatrixProps> = ({
  totalBudget,
  items,
  currency,
  onUpdateItems,
  onUpdateBudget,
  onUpdateCurrency,
}) => {
  const { summary, addItem, updateItem, deleteItem, toggleItemPaid } = useBudgetCalculator({
    totalBudget,
    items,
    currency,
    onUpdateItems,
    onUpdateBudget,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetLineItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    venue: true,
    catering: true,
    decor: true,
    media: true,
    contingency: true,
    other: true,
  });

  const [inlineNames, setInlineNames] = useState<Record<string, string>>({});
  const [inlineCosts, setInlineCosts] = useState<Record<string, string>>({});

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetLineItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleInlineAdd = (cat: BudgetCategory) => {
    const name = (inlineNames[cat] || '').trim();
    const cost = parseFloat(inlineCosts[cat] || '0');
    if (!name) return;

    addItem({
      name,
      category: cat,
      estimatedCost: cost,
      actualCost: cost,
      isPaid: false,
    });

    setInlineNames((prev) => ({ ...prev, [cat]: '' }));
    setInlineCosts((prev) => ({ ...prev, [cat]: '' }));
  };

  // Filtered items mapped by category
  const itemsByCategory = useMemo(() => {
    const map: Record<BudgetCategory, BudgetLineItem[]> = {
      venue: [],
      catering: [],
      decor: [],
      media: [],
      contingency: [],
      other: [],
    };

    items.forEach((item) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !(item.notes && item.notes.toLowerCase().includes(q))) {
          return;
        }
      }
      const cat = item.category || 'other';
      if (map[cat]) {
        map[cat].push(item);
      } else {
        map.other.push(item);
      }
    });

    return map;
  }, [items, debouncedSearch]);

  return (
    <section
      aria-label="Interactive Budget Matrix"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Top Controls Banner */}
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
            Interactive Budget Allocation Matrix
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Real-time subcategory targets (Venue 35%, Catering 30%, Decor 15%, Media 10%, Contingency 10%).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label htmlFor="currency-select" style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
              Currency:
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => onUpdateCurrency(e.target.value)}
              aria-label="Select display currency"
              style={{
                backgroundColor: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD (CA$)</option>
            </select>
          </div>

          <button
            type="button"
            id="btn-add-budget-item"
            className="btn-primary-glow"
            onClick={handleOpenAdd}
            style={{
              padding: '0.55rem 1.25rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Dynamic Alert Banner */}
      <BudgetAlertBanner
        isOverBudget={summary.isOverBudget}
        percentSpent={summary.percentSpent}
        totalSpent={summary.totalSpent}
        totalBudget={summary.totalBudget}
        remainingBudget={summary.remainingBudget}
        currency={currency}
      />

      {/* Visual Horizontal Stacked Progress Bar */}
      <BudgetDistributionBar
        categories={summary.categories}
        totalSpent={summary.totalSpent}
        totalBudget={summary.totalBudget}
        percentSpent={summary.percentSpent}
        currency={currency}
      />

      {/* Search Bar for Line Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '360px' }}>
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
          }}
        >
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search line items in matrix..."
            aria-label="Search line items"
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
      </div>

      {/* Cultural & Specialty Expense Lines Quick-Add Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          background: 'rgba(20, 26, 43, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1rem' }}>🪔</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              Cultural & Tradition Specialty Expenses
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              (1-Click Quick Add with Authentic Estimates)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            { name: 'Pandit / Priest Dakshina & Samagri', cost: 800, category: 'decor' as BudgetCategory, icon: '🕉️' },
            { name: 'Bridal Mehendi Artists & Henna Cones', cost: 1200, category: 'media' as BudgetCategory, icon: '🌿' },
            { name: 'Safa / Turban Tying Expert', cost: 450, category: 'decor' as BudgetCategory, icon: '👑' },
            { name: 'Live Dhol Players & Procession Band', cost: 950, category: 'media' as BudgetCategory, icon: '🥁' },
            { name: 'Return Favors (Artisanal Mithai Boxes)', cost: 1500, category: 'catering' as BudgetCategory, icon: '🎁' },
            { name: 'Brass Diya & Mandap Sacred Samagri', cost: 600, category: 'decor' as BudgetCategory, icon: '🪔' },
          ].map((quick) => (
            <button
              key={quick.name}
              type="button"
              onClick={() => {
                addItem({
                  name: quick.name,
                  category: quick.category,
                  estimatedCost: quick.cost,
                  actualCost: quick.cost,
                  isPaid: false,
                });
              }}
              className="btn-glass-glow"
              style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              <span>{quick.icon}</span>
              <span>{quick.name}</span>
              <span style={{ color: '#d4af37', fontWeight: 700 }}>+${quick.cost}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Category Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {summary.categories.map((cat) => {
          const config = RECOMMENDED_ALLOCATIONS[cat.category];
          const isExpanded = !!expandedCategories[cat.category];
          const catItems = itemsByCategory[cat.category] || [];

          return (
            <div
              key={cat.category}
              className="glass-panel"
              style={{
                borderRadius: '16px',
                border: cat.isOverBudget ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.category)}
                aria-expanded={isExpanded}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: config.color,
                      display: 'inline-block',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                        {cat.name}
                      </span>
                      <Badge variant="neutral" size="sm">
                        Target: {cat.targetPercent}% ({formatCurrency(cat.targetAmount, currency)})
                      </Badge>
                      {cat.isOverBudget && (
                        <Badge variant="danger" size="sm">
                          Over by {formatCurrency(Math.abs(cat.variance), currency)}
                        </Badge>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {catItems.length} expenses logged
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: cat.isOverBudget ? '#f87171' : '#f8fafc' }}>
                      {formatCurrency(cat.actualSpent, currency)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: cat.variance < 0 ? '#f87171' : '#34d399' }}>
                      {cat.variance >= 0 ? `+${formatCurrency(cat.variance, currency)} buffer` : `-${formatCurrency(Math.abs(cat.variance), currency)} excess`}
                    </div>
                  </div>

                  <div style={{ color: '#94a3b8' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: 'rgba(11, 15, 25, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Category Items Table */}
                  {catItems.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      No expenses logged in this category yet.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem 0' }}>Description</th>
                          <th style={{ padding: '0.5rem 0' }}>Estimated</th>
                          <th style={{ padding: '0.5rem 0' }}>Actual Cost</th>
                          <th style={{ padding: '0.5rem 0' }}>Payment</th>
                          <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catItems.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '0.65rem 0', color: '#f8fafc', fontWeight: 600 }}>
                              {item.name}
                              {item.notes && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.notes}</div>}
                            </td>
                            <td style={{ padding: '0.65rem 0', color: '#cbd5e1' }}>
                              {formatCurrency(item.estimatedCost, currency)}
                            </td>
                            <td style={{ padding: '0.65rem 0', color: item.actualCost > item.estimatedCost ? '#f87171' : '#f8fafc', fontWeight: 700 }}>
                              {formatCurrency(item.actualCost, currency)}
                            </td>
                            <td style={{ padding: '0.65rem 0' }}>
                              <button
                                type="button"
                                onClick={() => toggleItemPaid(item.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                <Badge variant={item.isPaid ? 'success' : 'warning'} size="sm">
                                  {item.isPaid ? 'Paid' : 'Pending'}
                                </Badge>
                              </button>
                            </td>
                            <td style={{ padding: '0.65rem 0', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  aria-label={`Edit ${item.name}`}
                                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem', color: '#cbd5e1', cursor: 'pointer' }}
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteItem(item.id)}
                                  aria-label={`Delete ${item.name}`}
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
                  )}

                  {/* Quick Inline Add Form */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <input
                      type="text"
                      placeholder={`+ Quick add to ${cat.name}...`}
                      value={inlineNames[cat.category] || ''}
                      onChange={(e) => setInlineNames((prev) => ({ ...prev, [cat.category]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleInlineAdd(cat.category);
                        }
                      }}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Amount ($)"
                      min="0"
                      value={inlineCosts[cat.category] || ''}
                      onChange={(e) => setInlineCosts((prev) => ({ ...prev, [cat.category]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleInlineAdd(cat.category);
                        }
                      }}
                      style={{
                        width: '120px',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleInlineAdd(cat.category)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid #6366f1',
                        color: '#818cf8',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Full Item Add / Edit */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(newItem) => {
          if (editingItem) {
            return updateItem(editingItem.id, newItem);
          }
          return addItem(newItem);
        }}
        initialData={editingItem}
      />
    </section>
  );
};
