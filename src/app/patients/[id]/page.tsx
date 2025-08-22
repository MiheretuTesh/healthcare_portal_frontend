'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useClaim, usePatient } from '@/contexts/AppProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import TableSkeleton from '@/components/TableSkeleton';
import { formatDate, formatCurrency } from '@/lib/utils';

const PatientClaimsPage = () => {
  const params = useParams();
  const patientId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);

  const { state: patientState, actions: patientActions } = usePatient();
  const { state: claimState, actions: claimActions } = useClaim();

  const patient = patientState.patients.find((p) => p.id === patientId) || patientState.selectedPatient;

  useEffect(() => {
    if (patientId) {
      claimActions.fetchClaims(patientId);
      if (!patient) {
        patientActions.fetchPatientById(patientId);
      }
    }
  }, [patientId, claimActions, patientActions]);

  const isInitialLoading = claimState.loading && claimState.filteredClaims.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient?.name || 'Patient'}</h1>
          {patient && (
            <p className="text-gray-600 text-sm">{patient.email} • {patient.phone} • {patient.insuranceProvider}</p>
          )}
        </div>
        <Link href="/claims" className="text-blue-600 hover:text-blue-800 text-sm">← Back to All Claims</Link>
      </div>

      {isInitialLoading ? (
        <TableSkeleton columns={4} title={`Loading claims for ${patient?.name || 'patient'}`} />
      ) : (
        <div className="relative bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Claims for {patient?.name || 'Patient'} ({claimState.filteredClaims.length})
            </h3>
          </div>
          {claimState.filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No claims found for this patient.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claimState.filteredClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.claimNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(claim.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(claim.serviceDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {claimState.loading && claimState.filteredClaims.length > 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-md">
              <LoadingSpinner size="md" text="Refreshing..." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientClaimsPage;


