import { useMemo, useCallback } from 'react';
import type { BudgetLineItem, BudgetMatrixSummary, CategorySummary, BudgetCategory } from '../types/budget';
import { addCurrency, subtractCurrency, multiplyCurrency, roundCurrency } from '../utils/currency';
import { validateNonNegativeNumber } from '../utils/validators';

export const RECOMMENDED_ALLOCATIONS: Record<BudgetCategory, { name: string; percent: number; color: string }> = {
  venue: { name: 'Venue & Facilities', percent: 35, color: '#4f46e5' },      // 35%
  catering: { name: 'Catering & Beverages', percent: 30, color: '#0ea5e9' }, // 30%
  decor: { name: 'Decor & Florals', percent: 15, color: '#ec4899' },         // 15%
  media: { name: 'Media & Photography', percent: 10, color: '#f59e0b' },     // 10%
  contingency: { name: 'Contingency Reserve', percent: 10, color: '#10b981' },// 10%
  other: { name: 'Other Miscellaneous', percent: 0, color: '#8b5cf6' },
};

interface UseBudgetCalculatorProps {
  totalBudget: number;
  items: BudgetLineItem[];
  currency?: string;
  onUpdateItems?: (items: BudgetLineItem[]) => void;
  onUpdateBudget?: (budget: number) => void;
}

export function useBudgetCalculator({
  totalBudget,
  items,
  currency = 'USD',
  onUpdateItems,
  onUpdateBudget,
}: UseBudgetCalculatorProps) {

  // Memoized matrix calculations
  const summary: BudgetMatrixSummary = useMemo(() => {
    const safeTotalBudget = Math.max(0, roundCurrency(totalBudget));

    let totalEstimated = 0;
    let totalSpent = 0;

    const categoryAllocated: Record<BudgetCategory, number> = {
      venue: 0,
      catering: 0,
      decor: 0,
      media: 0,
      contingency: 0,
      other: 0,
    };

    const categorySpent: Record<BudgetCategory, number> = {
      venue: 0,
      catering: 0,
      decor: 0,
      media: 0,
      contingency: 0,
      other: 0,
    };

    for (const item of items) {
      const est = Math.max(0, roundCurrency(item.estimatedCost));
      const actual = Math.max(0, roundCurrency(item.actualCost));

      totalEstimated = addCurrency(totalEstimated, est);
      totalSpent = addCurrency(totalSpent, actual);

      const cat = item.category || 'other';
      if (categoryAllocated[cat] !== undefined) {
        categoryAllocated[cat] = addCurrency(categoryAllocated[cat], est);
        categorySpent[cat] = addCurrency(categorySpent[cat], actual);
      } else {
        categoryAllocated.other = addCurrency(categoryAllocated.other, est);
        categorySpent.other = addCurrency(categorySpent.other, actual);
      }
    }

    const remainingBudget = subtractCurrency(safeTotalBudget, totalSpent);
    const contingencyReserve = multiplyCurrency(safeTotalBudget, RECOMMENDED_ALLOCATIONS.contingency.percent / 100);

    const categories: CategorySummary[] = (
      Object.keys(RECOMMENDED_ALLOCATIONS) as BudgetCategory[]
    ).map((catKey) => {
      const config = RECOMMENDED_ALLOCATIONS[catKey];
      const targetAmount = multiplyCurrency(safeTotalBudget, config.percent / 100);
      const allocated = categoryAllocated[catKey] || 0;
      const spent = categorySpent[catKey] || 0;
      const variance = subtractCurrency(targetAmount, spent);
      const isOver = targetAmount > 0 ? spent > targetAmount : spent > 0;
      const overBudgetPercentage = targetAmount > 0 
        ? roundCurrency(((spent - targetAmount) / targetAmount) * 100) 
        : 0;

      return {
        category: catKey,
        name: config.name,
        targetPercent: config.percent,
        targetAmount,
        allocatedAmount: allocated,
        actualSpent: spent,
        variance,
        isOverBudget: isOver,
        overBudgetPercentage: Math.max(0, overBudgetPercentage),
      };
    });

    const isOverBudget = totalSpent > safeTotalBudget;
    const percentSpent = safeTotalBudget > 0 
      ? roundCurrency((totalSpent / safeTotalBudget) * 100) 
      : 0;

    return {
      totalBudget: safeTotalBudget,
      totalEstimated,
      totalSpent,
      remainingBudget,
      contingencyReserve,
      isOverBudget,
      percentSpent,
      categories,
      currency,
    };
  }, [totalBudget, items, currency]);

  // Actions
  const addItem = useCallback(
    (newItem: Omit<BudgetLineItem, 'id'>): { success: boolean; error?: string } => {
      const validEst = validateNonNegativeNumber(newItem.estimatedCost, 'Estimated Cost');
      if (!validEst.valid) return { success: false, error: validEst.error };

      const validActual = validateNonNegativeNumber(newItem.actualCost, 'Actual Cost');
      if (!validActual.valid) return { success: false, error: validActual.error };

      if (!newItem.name.trim()) {
        return { success: false, error: 'Item name is required.' };
      }

      const item: BudgetLineItem = {
        id: `budget_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: newItem.name.trim(),
        category: newItem.category,
        estimatedCost: validEst.value,
        actualCost: validActual.value,
        isPaid: Boolean(newItem.isPaid),
        notes: newItem.notes?.trim() || '',
      };

      if (onUpdateItems) {
        onUpdateItems([...items, item]);
      }
      return { success: true };
    },
    [items, onUpdateItems]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<BudgetLineItem>): { success: boolean; error?: string } => {
      if (updates.estimatedCost !== undefined) {
        const valid = validateNonNegativeNumber(updates.estimatedCost, 'Estimated Cost');
        if (!valid.valid) return { success: false, error: valid.error };
        updates.estimatedCost = valid.value;
      }

      if (updates.actualCost !== undefined) {
        const valid = validateNonNegativeNumber(updates.actualCost, 'Actual Cost');
        if (!valid.valid) return { success: false, error: valid.error };
        updates.actualCost = valid.value;
      }

      const updated = items.map((it) => (it.id === id ? { ...it, ...updates } : it));
      if (onUpdateItems) {
        onUpdateItems(updated);
      }
      return { success: true };
    },
    [items, onUpdateItems]
  );

  const deleteItem = useCallback(
    (id: string) => {
      if (onUpdateItems) {
        onUpdateItems(items.filter((it) => it.id !== id));
      }
    },
    [items, onUpdateItems]
  );

  const toggleItemPaid = useCallback(
    (id: string) => {
      const updated = items.map((it) => (it.id === id ? { ...it, isPaid: !it.isPaid } : it));
      if (onUpdateItems) {
        onUpdateItems(updated);
      }
    },
    [items, onUpdateItems]
  );

  const setBudget = useCallback(
    (newBudget: number): { success: boolean; error?: string } => {
      const valid = validateNonNegativeNumber(newBudget, 'Total Budget');
      if (!valid.valid) return { success: false, error: valid.error };

      if (onUpdateBudget) {
        onUpdateBudget(valid.value);
      }
      return { success: true };
    },
    [onUpdateBudget]
  );

  return {
    summary,
    addItem,
    updateItem,
    deleteItem,
    toggleItemPaid,
    setBudget,
  };
}
