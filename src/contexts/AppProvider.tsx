'use client';

import { ReactNode } from 'react';
import { PatientProvider } from './PatientContext';
import { ClaimProvider } from './ClaimContext';
import { SyncProvider } from './SyncContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Root provider that wraps all context providers
 * This ensures all child components have access to all contexts
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <PatientProvider>
      <ClaimProvider>
        <SyncProvider>
          {children}
        </SyncProvider>
      </ClaimProvider>
    </PatientProvider>
  );
}

// Export all context hooks for convenience
export { usePatient } from './PatientContext';
export { useClaim } from './ClaimContext';
export { useSync } from './SyncContext';
