'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { Patient } from '@/types';
import { CreatePatientRequest, UpdatePatientRequest } from '@/types/api';
import { patientApi } from '@/lib/api';

// State interface
interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  selectedPatient: Patient | null;
}

// Action types
type PatientAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PATIENTS'; payload: Patient[] }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'SET_SELECTED_PATIENT'; payload: Patient | null };

// Initial state
const initialState: PatientState = {
  patients: [],
  loading: false,
  error: null,
  selectedPatient: null,
};

// Reducer
function patientReducer(state: PatientState, action: PatientAction): PatientState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PATIENTS':
      return { ...state, patients: action.payload, loading: false, error: null };
    case 'ADD_PATIENT':
      return { 
        ...state, 
        patients: [...state.patients, action.payload], 
        loading: false, 
        error: null 
      };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        selectedPatient: state.selectedPatient?.id === action.payload.id 
          ? action.payload 
          : state.selectedPatient,
        loading: false,
        error: null,
      };
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(p => p.id !== action.payload),
        selectedPatient: state.selectedPatient?.id === action.payload 
          ? null 
          : state.selectedPatient,
        loading: false,
        error: null,
      };
    case 'SET_SELECTED_PATIENT':
      return { ...state, selectedPatient: action.payload };
    default:
      return state;
  }
}

// Context interface
interface PatientContextValue {
  state: PatientState;
  actions: {
    fetchPatients: () => Promise<void>;
    fetchPatientById: (id: string) => Promise<Patient | null>;
    createPatient: (patient: CreatePatientRequest) => Promise<Patient | null>;
    updatePatient: (patient: UpdatePatientRequest) => Promise<Patient | null>;
    deletePatient: (id: string) => Promise<boolean>;
    setSelectedPatient: (patient: Patient | null) => void;
    clearError: () => void;
  };
}

// Create context
const PatientContext = createContext<PatientContextValue | undefined>(undefined);

// Provider component
interface PatientProviderProps {
  children: ReactNode;
}

export function PatientProvider({ children }: PatientProviderProps) {
  const [state, dispatch] = useReducer(patientReducer, initialState);

  // Action creators
  const fetchPatients = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await patientApi.getAll();
      if (response.success && response.data) {
        dispatch({ type: 'SET_PATIENTS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load patients' });
        dispatch({ type: 'SET_PATIENTS', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      dispatch({ type: 'SET_PATIENTS', payload: [] });
    }
  }, []);

  const fetchPatientById = useCallback(async (id: string): Promise<Patient | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await patientApi.getById(id);
      if (response.success && response.data) {
        dispatch({ type: 'SET_SELECTED_PATIENT', payload: response.data });
        dispatch({ type: 'SET_LOADING', payload: false });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load patient' });
        dispatch({ type: 'SET_SELECTED_PATIENT', payload: null });
        dispatch({ type: 'SET_LOADING', payload: false });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      dispatch({ type: 'SET_SELECTED_PATIENT', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
      return null;
    }
  }, []);

  const createPatient = useCallback(async (patientData: CreatePatientRequest): Promise<Patient | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await patientApi.create(patientData);
      if (response.success && response.data) {
        dispatch({ type: 'ADD_PATIENT', payload: response.data });
        return response.data;
      } else {
        // Fallback - do nothing without API
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create patient' });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      return null;
    }
  }, []);

  const updatePatient = useCallback(async (patientData: UpdatePatientRequest): Promise<Patient | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await patientApi.update(patientData);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_PATIENT', payload: response.data });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to update patient' });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      return null;
    }
  }, []);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await patientApi.delete(id);
      if (response.success) {
        dispatch({ type: 'DELETE_PATIENT', payload: id });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to delete patient' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      return false;
    }
  }, []);

  const setSelectedPatient = useCallback((patient: Patient | null) => {
    dispatch({ type: 'SET_SELECTED_PATIENT', payload: patient });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const actions = useMemo(() => ({
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    setSelectedPatient,
    clearError,
  }), [fetchPatients, fetchPatientById, createPatient, updatePatient, deletePatient, setSelectedPatient, clearError]);

  const value: PatientContextValue = {
    state,
    actions,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}

// Custom hook
export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
