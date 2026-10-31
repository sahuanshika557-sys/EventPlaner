export type VendorStatus = 
  | 'Contacted' 
  | 'Quote Received' 
  | 'Contract Signed' 
  | 'Deposit Paid' 
  | 'Fully Paid';

export type VendorCategory = 
  | 'Venue' 
  | 'Catering' 
  | 'Photography & Video' 
  | 'Decor & Florals' 
  | 'Music & DJ' 
  | 'Lighting & AV' 
  | 'Officiant / MC' 
  | 'Security & Safety' 
  | 'Other';

export interface VendorItem {
  id: string;
  name: string;
  category: VendorCategory;
  service: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: VendorStatus;
  contractAmount: number;
  depositPaid: number;
  balanceDue: number;
  balanceDueDate: string;
  notes?: string;
  contractUrl?: string;
}

export interface VendorFilterState {
  status: VendorStatus | 'All';
  category: VendorCategory | 'All';
  searchQuery: string;
}
