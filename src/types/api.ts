// API related types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Request types
export interface CreatePatientRequest {
  name: string;
  email: string;
  phone: string;
  insuranceProvider: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: string;
}

export interface CreateClaimRequest {
  patientId: string | number;
  amount: number;
  status: 'pending' | 'approved' | 'denied';
  serviceDate: string;
}

export interface UpdateClaimRequest extends Partial<CreateClaimRequest> {
  id: string;
}

export interface SyncRequest {
  type: 'patients' | 'claims' | 'all';
  forceUpdate?: boolean;
}
