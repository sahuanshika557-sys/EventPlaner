import { useMemo, useCallback, useState } from 'react';
import type { VendorItem, VendorStatus, VendorFilterState } from '../types/vendor';
import { roundCurrency, subtractCurrency } from '../utils/currency';
import { validateNonNegativeNumber, validateEmail } from '../utils/validators';
import { useDebounce } from './useDebounce';

interface UseVendorTrackerProps {
  vendors: VendorItem[];
  onUpdateVendors?: (vendors: VendorItem[]) => void;
}

export const VENDOR_STATUS_PROGRESSION: VendorStatus[] = [
  'Contacted',
  'Quote Received',
  'Contract Signed',
  'Deposit Paid',
  'Fully Paid',
];

export function useVendorTracker({ vendors, onUpdateVendors }: UseVendorTrackerProps) {
  const [filter, setFilter] = useState<VendorFilterState>({
    status: 'All',
    category: 'All',
    searchQuery: '',
  });

  const debouncedSearchQuery = useDebounce(filter.searchQuery, 300);

  // Filtered vendor list with memoization
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      // Status filter
      if (filter.status !== 'All' && v.status !== filter.status) {
        return false;
      }
      // Category filter
      if (filter.category !== 'All' && v.category !== filter.category) {
        return false;
      }
      // Search query
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(query);
        const matchesService = v.service.toLowerCase().includes(query);
        const matchesPerson = v.contactPerson.toLowerCase().includes(query);
        const matchesEmail = v.email.toLowerCase().includes(query);
        if (!matchesName && !matchesService && !matchesPerson && !matchesEmail) {
          return false;
        }
      }
      return true;
    });
  }, [vendors, filter.status, filter.category, debouncedSearchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalContractValue = 0;
    let totalDepositPaid = 0;
    let totalBalanceDue = 0;

    const countByStatus: Record<VendorStatus, number> = {
      'Contacted': 0,
      'Quote Received': 0,
      'Contract Signed': 0,
      'Deposit Paid': 0,
      'Fully Paid': 0,
    };

    for (const v of vendors) {
      totalContractValue += v.contractAmount || 0;
      totalDepositPaid += v.depositPaid || 0;
      totalBalanceDue += v.balanceDue || 0;
      if (countByStatus[v.status] !== undefined) {
        countByStatus[v.status]++;
      }
    }

    return {
      totalVendors: vendors.length,
      totalContractValue: roundCurrency(totalContractValue),
      totalDepositPaid: roundCurrency(totalDepositPaid),
      totalBalanceDue: roundCurrency(totalBalanceDue),
      countByStatus,
    };
  }, [vendors]);

  // Actions
  const addVendor = useCallback(
    (newV: Omit<VendorItem, 'id' | 'balanceDue'>): { success: boolean; error?: string } => {
      if (!newV.name.trim()) {
        return { success: false, error: 'Vendor name is required.' };
      }

      const validContract = validateNonNegativeNumber(newV.contractAmount, 'Contract Amount');
      if (!validContract.valid) return { success: false, error: validContract.error };

      const validDeposit = validateNonNegativeNumber(newV.depositPaid, 'Deposit Paid');
      if (!validDeposit.valid) return { success: false, error: validDeposit.error };

      if (validDeposit.value > validContract.value) {
        return { success: false, error: 'Deposit paid cannot exceed total contract amount.' };
      }

      if (newV.email && !validateEmail(newV.email)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      const balanceDue = subtractCurrency(validContract.value, validDeposit.value);

      const created: VendorItem = {
        ...newV,
        id: `vendor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        contractAmount: validContract.value,
        depositPaid: validDeposit.value,
        balanceDue,
      };

      if (onUpdateVendors) {
        onUpdateVendors([...vendors, created]);
      }
      return { success: true };
    },
    [vendors, onUpdateVendors]
  );

  const updateVendor = useCallback(
    (id: string, updates: Partial<VendorItem>): { success: boolean; error?: string } => {
      let contractAmount: number | undefined;
      let depositPaid: number | undefined;

      if (updates.contractAmount !== undefined) {
        const valid = validateNonNegativeNumber(updates.contractAmount, 'Contract Amount');
        if (!valid.valid) return { success: false, error: valid.error };
        contractAmount = valid.value;
      }

      if (updates.depositPaid !== undefined) {
        const valid = validateNonNegativeNumber(updates.depositPaid, 'Deposit Paid');
        if (!valid.valid) return { success: false, error: valid.error };
        depositPaid = valid.value;
      }

      if (updates.email && !validateEmail(updates.email)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      const updated = vendors.map((v) => {
        if (v.id !== id) return v;
        const currentContract = contractAmount !== undefined ? contractAmount : v.contractAmount;
        const currentDeposit = depositPaid !== undefined ? depositPaid : v.depositPaid;
        const newBalance = subtractCurrency(currentContract, currentDeposit);

        return {
          ...v,
          ...updates,
          contractAmount: currentContract,
          depositPaid: currentDeposit,
          balanceDue: Math.max(0, newBalance),
        };
      });

      if (onUpdateVendors) {
        onUpdateVendors(updated);
      }
      return { success: true };
    },
    [vendors, onUpdateVendors]
  );

  const transitionStatus = useCallback(
    (id: string, newStatus: VendorStatus) => {
      const updated = vendors.map((v) => {
        if (v.id !== id) return v;
        // If marked fully paid, adjust deposit to match contract amount and balance to 0
        if (newStatus === 'Fully Paid') {
          return {
            ...v,
            status: newStatus,
            depositPaid: v.contractAmount,
            balanceDue: 0,
          };
        }
        return { ...v, status: newStatus };
      });

      if (onUpdateVendors) {
        onUpdateVendors(updated);
      }
    },
    [vendors, onUpdateVendors]
  );

  const advanceToNextStatus = useCallback(
    (id: string) => {
      const target = vendors.find((v) => v.id === id);
      if (!target) return;

      const currentIndex = VENDOR_STATUS_PROGRESSION.indexOf(target.status);
      if (currentIndex < VENDOR_STATUS_PROGRESSION.length - 1) {
        const nextStatus = VENDOR_STATUS_PROGRESSION[currentIndex + 1];
        transitionStatus(id, nextStatus);
      }
    },
    [vendors, transitionStatus]
  );

  const deleteVendor = useCallback(
    (id: string) => {
      if (onUpdateVendors) {
        onUpdateVendors(vendors.filter((v) => v.id !== id));
      }
    },
    [vendors, onUpdateVendors]
  );

  return {
    filter,
    setFilter,
    filteredVendors,
    stats,
    addVendor,
    updateVendor,
    deleteVendor,
    transitionStatus,
    advanceToNextStatus,
  };
}
