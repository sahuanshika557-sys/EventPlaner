import type { VendorItem, VendorStatus } from '../types/vendor';
import type { BudgetLineItem } from '../types/budget';
import type { MacroMilestone } from '../types/timeline';
import { calculateDaysRemaining } from './time';

export interface VendorPipelineStats {
  total: number;
  inquiries: number;
  confirmed: number;
  paid: number;
  totalContract: number;
  totalBalance: number;
}

export interface BudgetSummaryStats {
  total: number;
  spent: number;
  estimated: number;
  remaining: number;
  percent: number;
  isCritical: boolean;
  isWarning: boolean;
  paidItems: number;
  unpaidItems: number;
}

export interface MilestoneSummaryStats {
  total: number;
  completed: number;
  pending: number;
  daysRemaining: number;
  percent: number;
}

/**
 * Normalizes any vendor status into one of 3 canonical pipeline stages:
 * Inquiry -> Confirmed -> Paid
 */
export function getCanonicalVendorStage(status: VendorStatus | string): 'inquiry' | 'confirmed' | 'paid' {
  const s = (status || '').toLowerCase().trim();
  if (s === 'fully paid' || s === 'paid') {
    return 'paid';
  }
  if (s === 'contract signed' || s === 'deposit paid' || s === 'confirmed') {
    return 'confirmed';
  }
  // Default for 'Contacted', 'Quote Received', 'Inquiry', or any unrecognized initial state
  return 'inquiry';
}

/**
 * Computes canonical vendor pipeline statistics.
 * Invariant guarantee: inquiries + confirmed + paid === total.
 */
export function getVendorPipelineStats(vendors: VendorItem[] = []): VendorPipelineStats {
  let inquiries = 0;
  let confirmed = 0;
  let paid = 0;
  let totalContract = 0;
  let totalBalance = 0;

  for (const v of vendors) {
    const stage = getCanonicalVendorStage(v.status);
    if (stage === 'paid') paid++;
    else if (stage === 'confirmed') confirmed++;
    else inquiries++;

    totalContract += Number(v.contractAmount) || 0;
    totalBalance += Number(v.balanceDue) || 0;
  }

  return {
    total: vendors.length,
    inquiries,
    confirmed,
    paid,
    totalContract,
    totalBalance,
  };
}

/**
 * Computes canonical budget statistics from items and cap.
 */
export function getBudgetSummaryStats(totalBudget: number = 0, items: BudgetLineItem[] = []): BudgetSummaryStats {
  const total = Math.max(0, totalBudget);
  const spent = items.reduce((acc, it) => acc + (Number(it.actualCost) || 0), 0);
  const estimated = items.reduce((acc, it) => acc + (Number(it.estimatedCost) || 0), 0);
  const remaining = Math.max(0, total - spent);
  const percent = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const isCritical = total > 0 ? spent > total : spent > 0;
  const isWarning = !isCritical && total > 0 && spent / total >= 0.9;
  const paidItems = items.filter((it) => it.isPaid).length;
  const unpaidItems = items.length - paidItems;

  return {
    total,
    spent,
    estimated,
    remaining,
    percent,
    isCritical,
    isWarning,
    paidItems,
    unpaidItems,
  };
}

/**
 * Computes canonical milestone completion stats.
 */
export function getMilestoneSummaryStats(milestones: MacroMilestone[] = [], eventDate: string = ''): MilestoneSummaryStats {
  const total = milestones.length;
  const completed = milestones.filter((m) => m.isCompleted).length;
  const pending = Math.max(0, total - completed);
  const daysRemaining = calculateDaysRemaining(eventDate);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    daysRemaining,
    percent,
  };
}

/**
 * Unified Readiness Score (0-100%):
 * 40% Milestones completed
 * 30% Vendors confirmed or paid
 * 20% Budget health (penalizes over-budget)
 * 10% Run-of-show schedule populated
 */
export function calculateReadinessScore(
  milestoneStats: MilestoneSummaryStats,
  vendorStats: VendorPipelineStats,
  budgetStats: BudgetSummaryStats,
  runOfShowCount: number = 0
): number {
  const milestonePart = milestoneStats.total > 0
    ? (milestoneStats.completed / milestoneStats.total) * 40
    : 20;

  const vendorPart = vendorStats.total > 0
    ? ((vendorStats.confirmed + vendorStats.paid) / vendorStats.total) * 30
    : 15;

  const budgetPart = budgetStats.isCritical ? 5 : budgetStats.isWarning ? 15 : 20;

  const runOfShowPart = runOfShowCount > 0 ? 10 : 5;

  return Math.min(100, Math.round(milestonePart + vendorPart + budgetPart + runOfShowPart));
}

