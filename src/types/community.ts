export type PermitStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Renewal Required';

export interface PublicSpacePermitItem {
  id: string;
  permitType: 'Park / Public Ground' | 'Sound & Amplification' | 'Food Vendor & Health' | 'Street Closure / Traffic' | 'Special Event / Alcohol';
  permitNumber: string;
  issuingAuthority: string;
  submissionDate: string;
  approvalStatus: PermitStatus;
  expirationDate: string;
  cost: number;
  contactOfficer: string;
  documentRef?: string;
}

export interface SafetyChecklistItem {
  id: string;
  category: 'First Aid' | 'Fire Safety' | 'Emergency Exits' | 'Weather Backup' | 'Crowd Barriers' | 'Sanitation';
  title: string;
  description: string;
  isInspected: boolean;
  inspectorName: string;
  status: 'Pass' | 'Attention Needed' | 'Pending';
  stationLocation: string;
}

export interface VolunteerShiftItem {
  id: string;
  volunteerName: string;
  role: 'Registration & Check-in' | 'Crowd Marshall' | 'Information Desk' | 'Waste Management / Eco' | 'First Aid Support' | 'Stage Logistics';
  shiftBlock: 'Morning (08:00 - 12:00)' | 'Afternoon (12:00 - 16:00)' | 'Evening (16:00 - 20:00)' | 'Breakdown / Night (20:00 - 23:00)';
  phone: string;
  emergencyContact: string;
  isCheckedIn: boolean;
  notes?: string;
}

export interface CrowdSafetyProtocol {
  id: string;
  maxCapacityThreshold: number;
  currentEstimatedAttendance: number;
  ingressEgressPoints: string[];
  evacuationRoutesSummary: string;
  lostAndFoundLocation: string;
  decibelMonitoringLimitDb: number;
  currentDecibelLevel: number;
  densityAlertLevel: 'Normal (Green)' | 'Moderate (Yellow)' | 'High Alert (Orange)' | 'Critical Capacity (Red)';
}
