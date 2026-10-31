import { describe, it, expect } from 'vitest';
import {
  getVendorPipelineStats,
  getBudgetSummaryStats,
  getMilestoneSummaryStats,
  calculateReadinessScore,
  getCanonicalVendorStage,
} from '../utils/eventSelectors';
import type { VendorItem } from '../types/vendor';
import type { BudgetLineItem } from '../types/budget';
import type { MacroMilestone } from '../types/timeline';

describe('Event Selectors & Single Source of Truth', () => {
  describe('Vendor Pipeline Selectors', () => {
    it('guarantees invariant: inquiries + confirmed + paid === total', () => {
      const mockVendors: VendorItem[] = [
        {
          id: 'v1',
          name: 'Grand Heritage Venue',
          category: 'Venue',
          service: 'Banquet Hall',
          contactPerson: 'Alice',
          email: 'alice@example.com',
          phone: '123',
          status: 'Contract Signed',
          contractAmount: 15000,
          depositPaid: 5000,
          balanceDue: 10000,
          balanceDueDate: '2026-11-20',
        },
        {
          id: 'v2',
          name: 'Royal Catering Co',
          category: 'Catering',
          service: 'Buffet',
          contactPerson: 'Bob',
          email: 'bob@example.com',
          phone: '456',
          status: 'Deposit Paid',
          contractAmount: 8000,
          depositPaid: 4000,
          balanceDue: 4000,
          balanceDueDate: '2026-11-20',
        },
        {
          id: 'v3',
          name: 'Starlight Photo Studio',
          category: 'Photography & Video',
          service: 'Photography',
          contactPerson: 'Charlie',
          email: 'charlie@example.com',
          phone: '789',
          status: 'Fully Paid',
          contractAmount: 3500,
          depositPaid: 3500,
          balanceDue: 0,
          balanceDueDate: '2026-11-20',
        },
        {
          id: 'v4',
          name: 'DJ Beats & Sound',
          category: 'Music & DJ',
          service: 'DJ & Sound',
          contactPerson: 'Dave',
          email: 'dave@example.com',
          phone: '101',
          status: 'Contacted',
          contractAmount: 2000,
          depositPaid: 0,
          balanceDue: 2000,
          balanceDueDate: '2026-11-20',
        },
      ];

      const stats = getVendorPipelineStats(mockVendors);

      expect(stats.total).toBe(4);
      expect(stats.inquiries).toBe(1); // 'Contacted'
      expect(stats.confirmed).toBe(2); // 'Contract Signed' + 'Deposit Paid'
      expect(stats.paid).toBe(1); // 'Fully Paid'
      expect(stats.inquiries + stats.confirmed + stats.paid).toBe(stats.total);
      expect(stats.totalContract).toBe(28500);
      expect(stats.totalBalance).toBe(16000);
    });

    it('correctly maps various status strings into canonical stages', () => {
      expect(getCanonicalVendorStage('Fully Paid')).toBe('paid');
      expect(getCanonicalVendorStage('Paid')).toBe('paid');
      expect(getCanonicalVendorStage('Contract Signed')).toBe('confirmed');
      expect(getCanonicalVendorStage('Deposit Paid')).toBe('confirmed');
      expect(getCanonicalVendorStage('Confirmed')).toBe('confirmed');
      expect(getCanonicalVendorStage('Contacted')).toBe('inquiry');
      expect(getCanonicalVendorStage('Quote Received')).toBe('inquiry');
      expect(getCanonicalVendorStage('Unknown Status')).toBe('inquiry');
    });

    it('handles empty vendor lists gracefully', () => {
      const stats = getVendorPipelineStats([]);
      expect(stats.total).toBe(0);
      expect(stats.inquiries).toBe(0);
      expect(stats.confirmed).toBe(0);
      expect(stats.paid).toBe(0);
      expect(stats.totalContract).toBe(0);
      expect(stats.totalBalance).toBe(0);
    });
  });

  describe('Budget Summary Selectors', () => {
    it('computes exact budget spent, remaining, and alert flags', () => {
      const mockItems: BudgetLineItem[] = [
        { id: 'b1', name: 'Venue', category: 'venue', estimatedCost: 10000, actualCost: 12000, isPaid: true },
        { id: 'b2', name: 'Food', category: 'catering', estimatedCost: 15000, actualCost: 14000, isPaid: false },
        { id: 'b3', name: 'Decor', category: 'decor', estimatedCost: 5000, actualCost: 5000, isPaid: false },
      ];

      const stats = getBudgetSummaryStats(35000, mockItems);

      expect(stats.total).toBe(35000);
      expect(stats.spent).toBe(31000);
      expect(stats.remaining).toBe(4000);
      expect(stats.percent).toBe(89);
      expect(stats.isCritical).toBe(false);
      expect(stats.isWarning).toBe(false);
      expect(stats.paidItems).toBe(1);
      expect(stats.unpaidItems).toBe(2);
    });

    it('flags warning when spent reaches 90% and critical when exceeding 100%', () => {
      const warningItems: BudgetLineItem[] = [
        { id: 'b1', name: 'Item', category: 'venue', estimatedCost: 9200, actualCost: 9200, isPaid: false },
      ];
      const warningStats = getBudgetSummaryStats(10000, warningItems);
      expect(warningStats.isWarning).toBe(true);
      expect(warningStats.isCritical).toBe(false);

      const criticalItems: BudgetLineItem[] = [
        { id: 'b1', name: 'Item', category: 'venue', estimatedCost: 11000, actualCost: 11000, isPaid: false },
      ];
      const criticalStats = getBudgetSummaryStats(10000, criticalItems);
      expect(criticalStats.isCritical).toBe(true);
      expect(criticalStats.remaining).toBe(0);
    });
  });

  describe('Milestone & Readiness Score Selectors', () => {
    it('computes milestone progress and readiness score correctly', () => {
      const milestones: MacroMilestone[] = [
        { id: 'm1', phase: 'T-90 days', phaseTitle: 'Planning', title: 'Pick Venue', description: '', dueDate: '2026-08-01', isCompleted: true, priority: 'high' },
        { id: 'm2', phase: 'T-60 days', phaseTitle: 'Vendors', title: 'Book Caterer', description: '', dueDate: '2026-09-01', isCompleted: true, priority: 'high' },
        { id: 'm3', phase: 'T-30 days', phaseTitle: 'Details', title: 'Send Invites', description: '', dueDate: '2026-10-01', isCompleted: false, priority: 'medium' },
        { id: 'm4', phase: 'T-7 days', phaseTitle: 'Final', title: 'Rehearsal', description: '', dueDate: '2026-10-24', isCompleted: false, priority: 'high' },
      ];

      const mStats = getMilestoneSummaryStats(milestones, '2026-11-20');
      expect(mStats.total).toBe(4);
      expect(mStats.completed).toBe(2);
      expect(mStats.pending).toBe(2);
      expect(mStats.percent).toBe(50);

      const vStats = { total: 4, inquiries: 1, confirmed: 2, paid: 1, totalContract: 20000, totalBalance: 5000 };
      const bStats = { total: 50000, spent: 30000, estimated: 45000, remaining: 20000, percent: 60, isCritical: false, isWarning: false, paidItems: 2, unpaidItems: 2 };

      const score = calculateReadinessScore(mStats, vStats, bStats, 5);
      expect(score).toBe(73);
    });
  });
});
