import { Patient, Claim, SyncResult } from '@/types';
import { 
  ApiResponse, 
  CreatePatientRequest, 
  UpdatePatientRequest,
  CreateClaimRequest,
  UpdateClaimRequest,
  SyncRequest
} from '@/types/api';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
function adaptPatientFromApi(p: any): Patient {
  return {
    id: String(p.id),
    name: p.name,
    email: p.email,
    phone: p.phone,
    insuranceProvider: p.insurance_provider,
  };
}

function adaptPatientToApi(p: CreatePatientRequest | UpdatePatientRequest) {
  const base: any = {
    name: p.name,
    email: p.email,
    phone: p.phone,
    insurance_provider: (p as any).insuranceProvider,
  };
  return base;
}

function adaptClaimFromApi(c: any): Claim {
  return {
    id: String(c.id),
    patientId: String(c.patient?.id ?? c.patientId ?? c.patient_id),
    patientName: c.patient?.name ?? c.patientName ?? '',
    claimNumber: c.claim_number ?? c.claimNumber ?? '',
    amount: typeof c.amount === 'string' ? parseFloat(c.amount) : Number(c.amount),
    status: c.status,
    serviceDate: c.service_date,
  };
}

function adaptClaimToApi(c: CreateClaimRequest | UpdateClaimRequest) {
  return {
    amount: String((c as any).amount),
    status: (c as any).status,
    service_date: (c as any).serviceDate,
    patientId: typeof (c as any).patientId === 'string' ? parseInt((c as any).patientId, 10) : (c as any).patientId,
  };
}

// Patient API functions
export const patientApi = {
  // Get all patients
  getAll: async (): Promise<ApiResponse<Patient[]>> => {
    const res = await apiRequest<any[]>('/patients');
    return res.success && res.data
      ? { success: true, data: res.data.map(adaptPatientFromApi) }
      : res as any;
  },

  // Get patient by ID
  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    const res = await apiRequest<any>(`/patients/${id}`);
    return res.success && res.data
      ? { success: true, data: adaptPatientFromApi(res.data) }
      : res as any;
  },

  // Create new patient
  create: async (patient: CreatePatientRequest): Promise<ApiResponse<Patient>> => {
    const res = await apiRequest<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(adaptPatientToApi(patient)),
    });
    return res.success && res.data
      ? { success: true, data: adaptPatientFromApi(res.data) }
      : res as any;
  },

  // Update patient
  update: async (patient: UpdatePatientRequest): Promise<ApiResponse<Patient>> => {
    const res = await apiRequest<any>(`/patients/${patient.id}`, {
      method: 'PUT',
      body: JSON.stringify(adaptPatientToApi(patient)),
    });
    return res.success && res.data
      ? { success: true, data: adaptPatientFromApi(res.data) }
      : res as any;
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
    const res = await apiRequest<any[]>(url);
    return res.success && res.data
      ? { success: true, data: res.data.map(adaptClaimFromApi) }
      : res as any;
  },

  // Get claim by ID
  getById: async (id: string): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<any>(`/claims/${id}`);
    return res.success && res.data
      ? { success: true, data: adaptClaimFromApi(res.data) }
      : res as any;
  },

  // Create new claim
  create: async (claim: CreateClaimRequest): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<any>('/claims', {
      method: 'POST',
      body: JSON.stringify(adaptClaimToApi(claim)),
    });
    return res.success && res.data
      ? { success: true, data: adaptClaimFromApi(res.data) }
      : res as any;
  },

  // Update claim
  update: async (claim: UpdateClaimRequest): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<any>(`/claims/${claim.id}`, {
      method: 'PUT',
      body: JSON.stringify(adaptClaimToApi(claim)),
    });
    return res.success && res.data
      ? { success: true, data: adaptClaimFromApi(res.data) }
      : res as any;
  },

  // Update claim status
  updateStatus: async (id: string, status: Claim['status']): Promise<ApiResponse<Claim>> => {
    const res = await apiRequest<any>(`/claims/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.success && res.data
      ? { success: true, data: adaptClaimFromApi(res.data) }
      : res as any;
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
  fetchHistory: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/sync/google-sheets/history', {
      method: 'POST',
    });
  },

  // Optional status endpoint if backend provides it
  getStatus: async (): Promise<ApiResponse<{ connected: boolean; lastSync?: string }>> => {
    return apiRequest<{ connected: boolean; lastSync?: string }>('/sync/status');
  },
};
