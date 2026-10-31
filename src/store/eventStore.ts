/**
 * Unified Event Store Module
 * Provides unified access to event state, mutation actions, and selectors.
 */

export { useEventPlanner } from '../hooks/useEventPlanner';
export {
  getBudgetSummaryStats,
  getMilestoneSummaryStats,
  getVendorPipelineStats,
  calculateReadinessScore,
  getCanonicalVendorStage,
} from '../utils/eventSelectors';
export type {
  BudgetSummaryStats,
  MilestoneSummaryStats,
  VendorPipelineStats,
} from '../utils/eventSelectors';
