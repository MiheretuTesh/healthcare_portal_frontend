'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Claim, ClaimStatus } from '@/types';
import { useClaim } from '@/contexts/AppProvider';
import ClaimForm from '@/components/ClaimForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDate, formatCurrency } from '@/lib/utils';
import ConfirmModal from '@/components/ConfirmModal';

const ClaimsPage = () => {
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  
  const { state, actions } = useClaim();
  const { filteredClaims, loading, error, statusFilter } = state;
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [updatingClaim, setUpdatingClaim] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; claimId?: string; action?: 'approved' | 'denied' | 'pending' }>(
    { open: false }
  );

  useEffect(() => {
    actions.fetchClaims(preselectedPatientId || undefined);
  }, [actions, preselectedPatientId]);

  const handleAddClaim = async (claimData: any) => {
    setIsSubmitting(true);
    try {
      const newClaim = await actions.createClaim(claimData);
      if (newClaim) {
        setShowForm(false);
        setMessage({ type: 'success', text: 'Claim added successfully!' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to add claim. Please try again.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add claim. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (claimId: string, newStatus: Claim['status']) => {
    setUpdatingClaim(claimId);
    try {
      const updatedClaim = await actions.updateClaimStatus(claimId, newStatus);
      if (updatedClaim) {
        setMessage({ type: 'success', text: `Claim status updated to ${newStatus}!` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update claim status. Please try again.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update claim status. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUpdatingClaim(null);
    }
  };

  const requestStatusChange = (claimId: string, newStatus: Claim['status']) => {
    setConfirm({ open: true, claimId, action: newStatus });
  };

  const handleConfirm = async () => {
    if (!confirm.claimId || !confirm.action) return;
    await handleStatusUpdate(confirm.claimId, confirm.action);
    setConfirm({ open: false });
  };

  const handleCancel = () => setConfirm({ open: false });



  const getStatusBadgeColor = (status: Claim['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const isInitialLoading = loading && filteredClaims.length === 0;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Claims Dashboard
          {preselectedPatientId && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              (Filtered by Patient)
            </span>
          )}
        </h1>
        <p className="text-gray-600">Manage insurance claims and update their status</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">     
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Claim
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-1">
          {(() => {
            const total = state.claims.length;
            const counts = {
              pending: state.claims.filter((c) => c.status === 'pending').length,
              approved: state.claims.filter((c) => c.status === 'approved').length,
              denied: state.claims.filter((c) => c.status === 'denied').length,
            };
            const tabs: { key: ClaimStatus; label: string; count: number; badge: string }[] = [
              { key: 'All', label: 'All', count: total, badge: 'bg-gray-100 text-gray-700' },
              { key: 'pending', label: 'Pending', count: counts.pending, badge: 'bg-yellow-100 text-yellow-800' },
              { key: 'approved', label: 'Approved', count: counts.approved, badge: 'bg-green-100 text-green-800' },
              { key: 'denied', label: 'Denied', count: counts.denied, badge: 'bg-red-100 text-red-800' },
            ];
            return tabs.map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => actions.setStatusFilter(tab.key)}
                  className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tab.badge}`}>{tab.count}</span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      

      {/* Claims Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Claims List ({filteredClaims.length})
          </h3>
        </div>
        
        {filteredClaims.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {statusFilter === 'All' 
                ? 'No claims found. Add your first claim to get started.' 
                : `No ${statusFilter.toLowerCase()} claims found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {claim.patientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={claim.claimNumber}>{claim.claimNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(claim.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(claim.status)}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(claim.serviceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {claim.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => requestStatusChange(claim.id, 'approved')}
                              disabled={updatingClaim === claim.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {updatingClaim === claim.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={() => requestStatusChange(claim.id, 'denied')}
                              disabled={updatingClaim === claim.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {updatingClaim === claim.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Deny'
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400">Finalized</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Overlay loader during status update */}
      {loading && filteredClaims.length > 0 && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-md">
          <LoadingSpinner size="md" text="Updating..." />
        </div>
      )}

      {/* Add Claim Form Modal */}
      {showForm && (
        <ClaimForm
          onSubmit={handleAddClaim}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
          preselectedPatientId={preselectedPatientId || undefined}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.action === 'approved' ? 'Approve Claim' : confirm.action === 'denied' ? 'Deny Claim' : 'Mark as Pending'}
        message={confirm.action === 'approved' ? 'Are you sure you want to approve this claim?' : confirm.action === 'denied' ? 'Are you sure you want to deny this claim?' : 'Are you sure you want to mark this claim as pending?'}
        confirmLabel={confirm.action === 'approved' ? 'Yes, Approve' : confirm.action === 'denied' ? 'Yes, Deny' : 'Yes, Pending'}
        confirmColor={confirm.action === 'approved' ? 'green' : confirm.action === 'denied' ? 'red' : 'yellow'}
        isLoading={!!updatingClaim}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ClaimsPage;
