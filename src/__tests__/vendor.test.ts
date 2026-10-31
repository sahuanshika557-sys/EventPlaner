import { describe, it, expect } from 'vitest';
import type { VendorItem } from '../types/vendor';
import { VENDOR_STATUS_PROGRESSION } from '../hooks/useVendorTracker';
import { subtractCurrency } from '../utils/currency';

describe('Vendor State Machine & Lifecycle Management', () => {
  it('follows the strict vendor pipeline progression sequence', () => {
    expect(VENDOR_STATUS_PROGRESSION).toEqual([
      'Contacted',
      'Quote Received',
      'Contract Signed',
      'Deposit Paid',
      'Fully Paid',
    ]);
  });

  it('correctly transitions state through the pipeline and updates balance due', () => {
    let vendor: VendorItem = {
      id: 'v1',
      name: 'Luxe Florals',
      category: 'Decor & Florals',
      service: 'Flower arrangements',
      contactPerson: 'Maya Lin',
      email: 'maya@luxeflora.com',
      phone: '+1 555-456-7890',
      status: 'Contacted',
      contractAmount: 5000,
      depositPaid: 0,
      balanceDue: 5000,
      balanceDueDate: '2026-11-01',
    };

    // 1. Advance to Quote Received
    vendor = { ...vendor, status: 'Quote Received' };
    expect(vendor.status).toBe('Quote Received');

    // 2. Advance to Contract Signed
    vendor = { ...vendor, status: 'Contract Signed' };
    expect(vendor.status).toBe('Contract Signed');

    // 3. Deposit Paid of $2,000
    const deposit = 2000;
    vendor = {
      ...vendor,
      status: 'Deposit Paid',
      depositPaid: deposit,
      balanceDue: subtractCurrency(vendor.contractAmount, deposit),
    };
    expect(vendor.status).toBe('Deposit Paid');
    expect(vendor.balanceDue).toBe(3000);

    // 4. Advance to Fully Paid: balance due becomes 0 and deposit becomes full contract amount
    vendor = {
      ...vendor,
      status: 'Fully Paid',
      depositPaid: vendor.contractAmount,
      balanceDue: 0,
    };
    expect(vendor.status).toBe('Fully Paid');
    expect(vendor.balanceDue).toBe(0);
  });

  it('filters vendor records by status, category, and search query', () => {
    const vendors: VendorItem[] = [
      {
        id: '1',
        name: 'Grand Ballroom',
        category: 'Venue',
        service: 'Palace Rental',
        contactPerson: 'Samantha',
        email: 'sam@venue.com',
        phone: '+1 555-1111',
        status: 'Contract Signed',
        contractAmount: 20000,
        depositPaid: 10000,
        balanceDue: 10000,
        balanceDueDate: '2026-11-01',
      },
      {
        id: '2',
        name: 'Epic Beats DJ',
        category: 'Music & DJ',
        service: 'DJ & Sound',
        contactPerson: 'Rohit',
        email: 'rohit@dj.com',
        phone: '+1 555-2222',
        status: 'Contacted',
        contractAmount: 2500,
        depositPaid: 0,
        balanceDue: 2500,
        balanceDueDate: '2026-11-15',
      },
      {
        id: '3',
        name: 'Royal Catering',
        category: 'Catering',
        service: 'Banquet food',
        contactPerson: 'Chef Dev',
        email: 'dev@catering.com',
        phone: '+1 555-3333',
        status: 'Fully Paid',
        contractAmount: 12000,
        depositPaid: 12000,
        balanceDue: 0,
        balanceDueDate: '2026-10-01',
      },
    ];

    // Status filter
    const contactedOnly = vendors.filter((v) => v.status === 'Contacted');
    expect(contactedOnly.length).toBe(1);
    expect(contactedOnly[0].id).toBe('2');

    // Category filter
    const venueOnly = vendors.filter((v) => v.category === 'Venue');
    expect(venueOnly.length).toBe(1);
    expect(venueOnly[0].name).toBe('Grand Ballroom');

    // Search query filter
    const searchMatch = vendors.filter(
      (v) =>
        v.name.toLowerCase().includes('beats') ||
        v.service.toLowerCase().includes('beats')
    );
    expect(searchMatch.length).toBe(1);
    expect(searchMatch[0].name).toBe('Epic Beats DJ');
  });

  it('handles item deletion and preserves list integrity', () => {
    const vendors: VendorItem[] = [
      { id: '1', name: 'A', category: 'Venue', service: '', contactPerson: '', email: '', phone: '', status: 'Contacted', contractAmount: 1000, depositPaid: 0, balanceDue: 1000, balanceDueDate: '' },
      { id: '2', name: 'B', category: 'Catering', service: '', contactPerson: '', email: '', phone: '', status: 'Contacted', contractAmount: 2000, depositPaid: 0, balanceDue: 2000, balanceDueDate: '' },
    ];

    const afterDelete = vendors.filter((v) => v.id !== '1');
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0].id).toBe('2');
  });
});
