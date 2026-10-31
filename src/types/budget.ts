export type BudgetCategory = 'venue' | 'catering' | 'decor' | 'media' | 'contingency' | 'other';

export interface BudgetAllocationTarget {
  category: BudgetCategory;
  name: string;
  targetPercent: number; // e.g. 35 for venue, 30 catering, 15 decor, 10 media, 10 contingency
  color: string;
}

export interface BudgetLineItem {
  id: string;
  name: string;
  category: BudgetCategory;
  estimatedCost: number;
  actualCost: number;
  isPaid: boolean;
  notes?: string;
}

export interface CategorySummary {
  category: BudgetCategory;
  name: string;
  targetPercent: number;
  targetAmount: number;
  allocatedAmount: number;
  actualSpent: number;
  variance: number; // targetAmount - actualSpent
  isOverBudget: boolean;
  overBudgetPercentage: number;
}

export interface BudgetMatrixSummary {
  totalBudget: number;
  totalEstimated: number;
  totalSpent: number;
  remainingBudget: number;
  contingencyReserve: number;
  isOverBudget: boolean;
  percentSpent: number;
  categories: CategorySummary[];
  currency: string;
}
