export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  insuranceProvider: string;
}

export interface Claim {
  id: string;
  patientId: string;
  patientName: string;
  claimNumber: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied';
  serviceDate: string; // YYYY-MM-DD or ISO
}

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  recordsSync: number;
}

export type ClaimStatus = 'All' | 'pending' | 'approved' | 'denied';
