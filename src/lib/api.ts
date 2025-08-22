import { Patient, Claim } from '@/types';
import { 
  ApiResponse, 
  CreatePatientRequest, 
  UpdatePatientRequest,
  CreateClaimRequest,
  UpdateClaimRequest
} from '@/types/api';

// Types for API responses from backend
interface BackendPatient {
  id: number;
  name: string;
  email: string;
  phone: string;
  insurance_provider: string;
}

interface BackendClaim {
  id: number;
  claim_number: string;
  amount: string | number;
  status: string;
  service_date: string;
  patient?: BackendPatient;
  patientId?: number;
  patient_id?: number;
  patientName?: string;
  claimNumber?: string;
}

// Base API configuration via environment
// Prefer explicit APP env mapping; fall back to a single URL or localhost
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';
const API_BASE_URL =
  APP_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_API_URL_PROD || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Adapters between backend shapes and FE types
function adaptPatientFromApi(p: BackendPatient): Patient {
  return {
    id: String(p.id),
    name: String(p.name),
    email: String(p.email),
    phone: String(p.phone),
    insuranceProvider: String(p.insurance_provider),
  };
}

function adaptPatientToApi(p: CreatePatientRequest | UpdatePatientRequest) {
  const base: Record<string, unknown> = {
    name: p.name,
    email: p.email,
    phone: p.phone,
    insurance_provider: (p as CreatePatientRequest).insuranceProvider,
  };
  return base;
}

function adaptClaimFromApi(c: BackendClaim): Claim {
  const patient = c.patient as BackendPatient | undefined;
  return {
    id: String(c.id),
    patientId: String(patient?.id ?? c.patientId ?? c.patient_id),
    patientName: String(patient?.name ?? c.patientName ?? ''),
    claimNumber: String(c.claim_number ?? c.claimNumber ?? ''),
    amount: typeof c.amount === 'string' ? parseFloat(c.amount) : Number(c.amount),
    status: c.status as Claim['status'],
    serviceDate: String(c.service_date),
  };
}

function adaptClaimToApi(c: CreateClaimRequest | UpdateClaimRequest) {
  const claim = c as CreateClaimRequest;
  return {
    amount: String(claim.amount),
    status: claim.status,
    service_date: claim.serviceDate,
    patientId: typeof claim.patientId === 'string' ? parseInt(claim.patientId, 10) : claim.patientId,
  };
}

// Patient API functions
export const patientApi = {
  // Get all patients
  getAll: async (): Promise<ApiResponse<Patient[]>> => {
    const res = await apiRequest<BackendPatient[]>('/patients');
    if (res.success && res.data) {
      return { success: true, data: res.data.map(adaptPatientFromApi) };
    }
    return { success: false, error: res.error };
  },

  // Get patient by ID
  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    const res = await apiRequest<BackendPatient>(`/patients/${id}`);
    if (res.success && res.data) {
      return { success: true, data: adaptPatientFromApi(res.data) };
    }
    return { success: false, error: res.error };
  },

  // Create new patient
  create: async (patient: CreatePatientRequest): Promise<ApiResponse<Patient>> => {
    const res = await apiRequest<BackendPatient>('/patients', {
      method: 'POST',
      body: JSON.stringify(adaptPatientToApi(patient)),
    });
    if (res.success && res.data) {
      return { success: true, data: adaptPatientFromApi(res.data) };
    }
    return { success: false, error: res.error };
  },

  // Update patient
  update: async (patient: UpdatePatientRequest): Promise<ApiResponse<Patient>> => {
    const res = await apiRequest<BackendPatient>(`/patients/${patient.id}`, {
      method: 'PUT',
      body: JSON.stringify(adaptPatientToApi(patient)),
    });
    if (res.success && res.data) {
      return { success: true, data: adaptPatientFromApi(res.data) };
    }
    return { success: false, error: res.error };
  },

  // Delete patient
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/patients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Claims API functions
export const claimApi = {
  // Get all claims
  getAll: async (patientId?: string): Promise<ApiResponse<Claim[]>> => {
    const url = patientId ? `/patients/${patientId}/claims` : '/claims';
    const res = await apiRequest<BackendClaim[]>(url);
    if (res.success && res.data) {
      return { success: true, data: res.data.map(adaptClaimFromApi) };
    }
    return { success: false, error: res.error };
  },

  // Get claim by ID
  getById: async (id: string): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<BackendClaim>(`/claims/${id}`);
    if (res.success && res.data) {
      return { success: true, data: adaptClaimFromApi(res.data) };
    }
    return { success: false, error: res.error };
  },

  // Create new claim
  create: async (claim: CreateClaimRequest): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<BackendClaim>('/claims', {
      method: 'POST',
      body: JSON.stringify(adaptClaimToApi(claim)),
    });
    if (res.success && res.data) {
      return { success: true, data: adaptClaimFromApi(res.data) };
    }
    return { success: false, error: res.error };
  },

  // Update claim
  update: async (claim: UpdateClaimRequest): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<BackendClaim>(`/claims/${claim.id}`, {
      method: 'PUT',
      body: JSON.stringify(adaptClaimToApi(claim)),
    });
    if (res.success && res.data) {
      return { success: true, data: adaptClaimFromApi(res.data) };
    }
    return { success: false, error: res.error };
  },

  // Update claim status
  updateStatus: async (id: string, status: Claim['status']): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<BackendClaim>(`/claims/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (res.success && res.data) {
      return { success: true, data: adaptClaimFromApi(res.data) };
    }
    return { success: false, error: res.error };
  },

  // Delete claim
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/claims/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sync API functions
export const syncApi = {
  // Sync claims to Google Sheets
  syncClaims: async (): Promise<ApiResponse<{ insertedCount: number }>> => {
    return apiRequest<{ insertedCount: number }>('/sync/google-sheets', {
      method: 'POST',
    });
  },

  // Sync patients to Google Sheets
  syncPatients: async (): Promise<ApiResponse<{ insertedCount: number }>> => {
    return apiRequest<{ insertedCount: number }>('/sync/google-sheets/patients', {
      method: 'POST',
    });
  },

  // Fetch recent sync history
  fetchHistory: async (): Promise<ApiResponse<Array<{
    type: string;
    count: number;
    inserted_rows?: number[];
    created_at: string;
  }>>> => {
    return apiRequest<Array<{
      type: string;
      count: number;
      inserted_rows?: number[];
      created_at: string;
    }>>('/sync/google-sheets/history', {
      method: 'POST',
    });
  },

  // Optional status endpoint if backend provides it
  getStatus: async (): Promise<ApiResponse<{ connected: boolean; lastSync?: string }>> => {
    return apiRequest<{ connected: boolean; lastSync?: string }>('/sync/status');
  },
};
