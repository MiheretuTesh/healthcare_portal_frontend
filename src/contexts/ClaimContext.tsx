'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useMemo, ReactNode } from 'react';
import { Claim, ClaimStatus } from '@/types';
import { CreateClaimRequest, UpdateClaimRequest } from '@/types/api';
import { claimApi } from '@/lib/api';

// State interface
interface ClaimState {
  claims: Claim[];
  filteredClaims: Claim[];
  loading: boolean;
  error: string | null;
  selectedClaim: Claim | null;
  statusFilter: ClaimStatus;
  patientFilter: string | null;
}

// Action types
type ClaimAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CLAIMS'; payload: Claim[] }
  | { type: 'ADD_CLAIM'; payload: Claim }
  | { type: 'UPDATE_CLAIM'; payload: Claim }
  | { type: 'DELETE_CLAIM'; payload: string }
  | { type: 'SET_SELECTED_CLAIM'; payload: Claim | null }
  | { type: 'SET_STATUS_FILTER'; payload: ClaimStatus }
  | { type: 'SET_PATIENT_FILTER'; payload: string | null }
  | { type: 'FILTER_CLAIMS' };

// Initial state
const initialState: ClaimState = {
  claims: [],
  filteredClaims: [],
  loading: false,
  error: null,
  selectedClaim: null,
  statusFilter: 'All',
  patientFilter: null,
};

// Reducer
function claimReducer(state: ClaimState, action: ClaimAction): ClaimState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CLAIMS':
      const newState = { ...state, claims: action.payload, loading: false, error: null };
      return { ...newState, filteredClaims: filterClaims(newState) };
    case 'ADD_CLAIM':
      const stateWithNewClaim = { 
        ...state, 
        claims: [...state.claims, action.payload], 
        loading: false, 
        error: null 
      };
      return { ...stateWithNewClaim, filteredClaims: filterClaims(stateWithNewClaim) };
    case 'UPDATE_CLAIM':
      const stateWithUpdatedClaim = {
        ...state,
        claims: state.claims.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
        selectedClaim: state.selectedClaim?.id === action.payload.id 
          ? action.payload 
          : state.selectedClaim,
        loading: false,
        error: null,
      };
      return { ...stateWithUpdatedClaim, filteredClaims: filterClaims(stateWithUpdatedClaim) };
    case 'DELETE_CLAIM':
      const stateWithDeletedClaim = {
        ...state,
        claims: state.claims.filter(c => c.id !== action.payload),
        selectedClaim: state.selectedClaim?.id === action.payload 
          ? null 
          : state.selectedClaim,
        loading: false,
        error: null,
      };
      return { ...stateWithDeletedClaim, filteredClaims: filterClaims(stateWithDeletedClaim) };
    case 'SET_SELECTED_CLAIM':
      return { ...state, selectedClaim: action.payload };
    case 'SET_STATUS_FILTER':
      const stateWithStatusFilter = { ...state, statusFilter: action.payload };
      return { ...stateWithStatusFilter, filteredClaims: filterClaims(stateWithStatusFilter) };
    case 'SET_PATIENT_FILTER':
      const stateWithPatientFilter = { ...state, patientFilter: action.payload };
      return { ...stateWithPatientFilter, filteredClaims: filterClaims(stateWithPatientFilter) };
    case 'FILTER_CLAIMS':
      return { ...state, filteredClaims: filterClaims(state) };
    default:
      return state;
  }
}

// Helper function to filter claims
function filterClaims(state: ClaimState): Claim[] {
  let filtered = state.claims;

  if (state.statusFilter !== 'All') {
    filtered = filtered.filter(claim => claim.status === state.statusFilter);
  }

  if (state.patientFilter) {
    filtered = filtered.filter(claim => claim.patientId === state.patientFilter);
  }

  return filtered;
}

// Context interface
interface ClaimContextValue {
  state: ClaimState;
  actions: {
    fetchClaims: (patientId?: string) => Promise<void>;
    fetchClaimById: (id: string) => Promise<Claim | null>;
    createClaim: (claim: CreateClaimRequest) => Promise<Claim | null>;
    updateClaim: (claim: UpdateClaimRequest) => Promise<Claim | null>;
    updateClaimStatus: (id: string, status: Claim['status']) => Promise<Claim | null>;
    deleteClaim: (id: string) => Promise<boolean>;
    setSelectedClaim: (claim: Claim | null) => void;
    setStatusFilter: (filter: ClaimStatus) => void;
    setPatientFilter: (patientId: string | null) => void;
    clearError: () => void;
  };
}

// Create context
const ClaimContext = createContext<ClaimContextValue | undefined>(undefined);

// Provider component
interface ClaimProviderProps {
  children: ReactNode;
}

export function ClaimProvider({ children }: ClaimProviderProps) {
  const [state, dispatch] = useReducer(claimReducer, initialState);

  // Create a ref to always access the latest state
  const stateRef = useRef(state);
  stateRef.current = state;

  // Action creators
  const fetchClaims = useCallback(async (patientId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    if (patientId) {
      dispatch({ type: 'SET_PATIENT_FILTER', payload: patientId });
    }
    
    try {
      const response = await claimApi.getAll(patientId);
      if (response.success && response.data) {
        dispatch({ type: 'SET_CLAIMS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load claims' });
        dispatch({ type: 'SET_CLAIMS', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      dispatch({ type: 'SET_CLAIMS', payload: [] });
    }
  }, []);

  const fetchClaimById = useCallback(async (id: string): Promise<Claim | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await claimApi.getById(id);
      if (response.success && response.data) {
        dispatch({ type: 'SET_SELECTED_CLAIM', payload: response.data });
        dispatch({ type: 'SET_LOADING', payload: false });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load claim' });
        dispatch({ type: 'SET_SELECTED_CLAIM', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      dispatch({ type: 'SET_SELECTED_CLAIM', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
      return null;
    }
  }, []);

  const createClaim = useCallback(async (claimData: CreateClaimRequest): Promise<Claim | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await claimApi.create(claimData);
      if (response.success && response.data) {
        dispatch({ type: 'ADD_CLAIM', payload: response.data });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to create claim' });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      return null;
    }
  }, []);

  const updateClaim = useCallback(async (claimData: UpdateClaimRequest): Promise<Claim | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await claimApi.update(claimData);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_CLAIM', payload: response.data });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to update claim' });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      return null;
    }
  }, []);

  const updateClaimStatus = useCallback(async (id: string, status: Claim['status']): Promise<Claim | null> => {
    try {
      // Prevent changing status once it's approved or denied
      const current = stateRef.current.claims.find(c => c.id === id);
      if (current && current.status !== 'pending') {
        dispatch({ type: 'SET_ERROR', payload: 'This claim status is final and cannot be changed.' });
        return null;
      }
      const response = await claimApi.updateStatus(id, status);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_CLAIM', payload: response.data });
        return response.data;
      } else {
        // Fallback for development - simulate update using current state
        const existingClaim = stateRef.current.claims.find(c => c.id === id);
        if (existingClaim) {
          const updatedClaim: Claim = {
            ...existingClaim,
            status,
          };
          dispatch({ type: 'UPDATE_CLAIM', payload: updatedClaim });
          return updatedClaim;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Claim not found' });
        return null;
      }
    } catch (error) {
      // Fallback for development
      const existingClaim = stateRef.current.claims.find(c => c.id === id);
      if (existingClaim) {
        const updatedClaim: Claim = {
          ...existingClaim,
          status,
        };
        dispatch({ type: 'UPDATE_CLAIM', payload: updatedClaim });
        return updatedClaim;
      }
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      return null;
    }
  }, []);

  const deleteClaim = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await claimApi.delete(id);
      if (response.success) {
        dispatch({ type: 'DELETE_CLAIM', payload: id });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to delete claim' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      return false;
    }
  }, []);

  const setSelectedClaim = useCallback((claim: Claim | null) => {
    dispatch({ type: 'SET_SELECTED_CLAIM', payload: claim });
  }, []);

  const setStatusFilter = useCallback((filter: ClaimStatus) => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: filter });
  }, []);

  const setPatientFilter = useCallback((patientId: string | null) => {
    dispatch({ type: 'SET_PATIENT_FILTER', payload: patientId });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const actions = useMemo(() => ({
    fetchClaims,
    fetchClaimById,
    createClaim,
    updateClaim,
    updateClaimStatus,
    deleteClaim,
    setSelectedClaim,
    setStatusFilter,
    setPatientFilter,
    clearError,
  }), [fetchClaims, fetchClaimById, createClaim, updateClaim, updateClaimStatus, deleteClaim, setSelectedClaim, setStatusFilter, setPatientFilter, clearError]);

  const value: ClaimContextValue = {
    state,
    actions,
  };

  return (
    <ClaimContext.Provider value={value}>
      {children}
    </ClaimContext.Provider>
  );
}

// Custom hook
export function useClaim() {
  const context = useContext(ClaimContext);
  if (context === undefined) {
    throw new Error('useClaim must be used within a ClaimProvider');
  }
  return context;
}
