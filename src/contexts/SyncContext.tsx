'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { SyncResult } from '@/types';
import { syncApi } from '@/lib/api';

// State interface
interface SyncState {
  syncHistory: SyncResult[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastSync: string | null;
}

// Action types
type SyncAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SYNC_HISTORY'; payload: SyncResult[] }
  | { type: 'ADD_SYNC_RESULT'; payload: SyncResult }
  | { type: 'SET_CONNECTION_STATUS'; payload: { connected: boolean; lastSync?: string } };

// Initial state
const initialState: SyncState = {
  syncHistory: [],
  loading: false,
  error: null,
  isConnected: false,
  lastSync: null,
};

// Reducer
function syncReducer(state: SyncState, action: SyncAction): SyncState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SYNC_HISTORY':
      return { 
        ...state, 
        syncHistory: action.payload, 
        loading: false, 
        error: null 
      };
    case 'ADD_SYNC_RESULT':
      return {
        ...state,
        syncHistory: [action.payload, ...state.syncHistory],
        loading: false,
        error: null,
        lastSync: action.payload.timestamp,
        isConnected: action.payload.success ? true : state.isConnected,
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload.connected,
        lastSync: action.payload.lastSync || state.lastSync,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

// Context interface
interface SyncContextValue {
  state: SyncState;
  actions: {
    syncClaims: () => Promise<{ insertedCount: number } | null>;
    syncPatients: () => Promise<{ insertedCount: number } | null>;
    fetchSyncHistory: () => Promise<void>;
    checkSyncStatus: () => Promise<void>;
    clearError: () => void;
  };
}

// Create context
const SyncContext = createContext<SyncContextValue | undefined>(undefined);

// Provider component
interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const [state, dispatch] = useReducer(syncReducer, initialState);

  // Action creators
  const syncClaims = useCallback(async (): Promise<{ insertedCount: number } | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await syncApi.syncClaims();
      if (response.success && response.data) {
        const result: SyncResult = {
          success: true,
          message: `Claims: inserted ${response.data.insertedCount} rows`,
          timestamp: new Date().toISOString(),
          recordsSync: response.data.insertedCount,
        };
        dispatch({ type: 'ADD_SYNC_RESULT', payload: result });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Sync failed' });
        return null;
      }
    } catch (_error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error occurred' });
      dispatch({ type: 'SET_SYNC_HISTORY', payload: [] });
      return null;
    }
  }, []);

  const syncPatients = useCallback(async (): Promise<{ insertedCount: number } | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await syncApi.syncPatients();
      if (response.success && response.data) {
        const result: SyncResult = {
          success: true,
          message: `Patients: inserted ${response.data.insertedCount} rows`,
          timestamp: new Date().toISOString(),
          recordsSync: response.data.insertedCount,
        };
        dispatch({ type: 'ADD_SYNC_RESULT', payload: result });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Sync failed' });
        return null;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const fetchSyncHistory = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await syncApi.fetchHistory();
      if (response.success && response.data) {
        interface HistoryItem {
          type: string;
          count: number;
          inserted_rows?: number[];
          created_at: string;
        }
        
        const mapped: SyncResult[] = response.data.map((h: HistoryItem) => ({
          success: true,
          message: `${h.type}: inserted ${h.count} rows (${(h.inserted_rows || []).join(', ')})`,
          timestamp: h.created_at,
          recordsSync: h.count,
        }));
        dispatch({ type: 'SET_SYNC_HISTORY', payload: mapped });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (_error) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const checkSyncStatus = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await syncApi.getStatus();
      if (response.success && response.data) {
        dispatch({ 
          type: 'SET_CONNECTION_STATUS', 
          payload: { 
            connected: response.data.connected, 
            lastSync: response.data.lastSync 
          } 
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (_error) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const actions = useMemo(() => ({
    syncClaims,
    syncPatients,
    fetchSyncHistory,
    checkSyncStatus,
    clearError,
  }), [syncClaims, syncPatients, fetchSyncHistory, checkSyncStatus, clearError]);

  const value: SyncContextValue = {
    state,
    actions,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

// Custom hook
export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
