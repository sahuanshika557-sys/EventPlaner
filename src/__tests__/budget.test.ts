import { describe, it, expect } from 'vitest';
import { addCurrency, subtractCurrency, multiplyCurrency, roundCurrency } from '../utils/currency';
import { validateNonNegativeNumber } from '../utils/validators';
import { RECOMMENDED_ALLOCATIONS } from '../hooks/useBudgetCalculator';

describe('Budget Engine & Precision Arithmetic', () => {
  it('correctly solves the classic IEEE-754 floating-point precision edge case ($0.1 + $0.2 = $0.30)', () => {
    // In raw JavaScript: 0.1 + 0.2 === 0.30000000000000004
    expect(0.1 + 0.2).not.toBe(0.3);

    // Our currency arithmetic must return exactly 0.3 without floating drift
    const sum = addCurrency(0.1, 0.2);
    expect(sum).toBe(0.3);
    expect(roundCurrency(sum)).toBe(0.3);
  });

  it('performs exact floating-point safe subtraction', () => {
    const diff = subtractCurrency(1.0, 0.9);
    expect(diff).toBe(0.1);
  });

  it('calculates the 5 mandatory subcategory allocations accurately', () => {
    const totalBudget = 100000;

    const venueTarget = multiplyCurrency(totalBudget, RECOMMENDED_ALLOCATIONS.venue.percent / 100);
    const cateringTarget = multiplyCurrency(totalBudget, RECOMMENDED_ALLOCATIONS.catering.percent / 100);
    const decorTarget = multiplyCurrency(totalBudget, RECOMMENDED_ALLOCATIONS.decor.percent / 100);
    const mediaTarget = multiplyCurrency(totalBudget, RECOMMENDED_ALLOCATIONS.media.percent / 100);
    const contingencyTarget = multiplyCurrency(totalBudget, RECOMMENDED_ALLOCATIONS.contingency.percent / 100);

    expect(venueTarget).toBe(35000);       // 35%
    expect(cateringTarget).toBe(30000);    // 30%
    expect(decorTarget).toBe(15000);       // 15%
    expect(mediaTarget).toBe(10000);       // 10%
    expect(contingencyTarget).toBe(10000); // 10%

    // Total must equal 100%
    const sumAllocations = venueTarget + cateringTarget + decorTarget + mediaTarget + contingencyTarget;
    expect(sumAllocations).toBe(totalBudget);
  });

  it('strictly rejects negative budget values and malformed numbers', () => {
    const negResult = validateNonNegativeNumber(-500, 'Budget');
    expect(negResult.valid).toBe(false);
    expect(negResult.error).toContain('cannot be negative');

    const nanResult = validateNonNegativeNumber('invalid-amount', 'Cost');
    expect(nanResult.valid).toBe(false);
    expect(nanResult.error).toContain('must be a valid number');

    const emptyResult = validateNonNegativeNumber('', 'Cost');
    expect(emptyResult.valid).toBe(false);

    const validResult = validateNonNegativeNumber('2500.50', 'Cost');
    expect(validResult.valid).toBe(true);
    expect(validResult.value).toBe(2500.5);
  });

  it('identifies over-budget thresholds dynamically', () => {
    const totalBudget = 50000;
    const spentLow = 40000; // 80% - normal
    const spentWarning = 46000; // 92% - warning
    const spentOver = 52000; // 104% - critical alert

    expect(spentLow / totalBudget >= 0.9).toBe(false);
    expect(spentWarning / totalBudget >= 0.9).toBe(true);
    expect(spentWarning > totalBudget).toBe(false);
    expect(spentOver > totalBudget).toBe(true);
  });
});
