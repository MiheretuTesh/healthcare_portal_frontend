'use client';

import { useState, useEffect } from 'react';
import { SyncResult } from '@/types';
import { useSync } from '@/contexts/AppProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import TableSkeleton from '@/components/TableSkeleton';
import { formatDateTime } from '@/lib/utils';

const SyncPage = () => {
  const { state, actions } = useSync();
  const { syncHistory, loading } = state;
  
  const [isSync, setIsSync] = useState(false);

  useEffect(() => {
    actions.fetchSyncHistory();
  }, [actions]);

  const handleSync = async () => {
    setIsSync(true);
    
    try {
      await actions.syncClaims();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSync(false);
    }
  };

  // Patients sync removed



  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBgColor = (success: boolean) => {
    return success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Sync</h1>
        <p className="text-gray-600">Synchronize patient and claims data with Google Sheets</p>
      </div>

      {/* Sync Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Sheets Integration</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Click the button below to sync unsynced claims to your Google Sheets document.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1">
            {isSync && (
              <div className="flex items-center space-x-3 text-blue-600">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium">Syncing data to Google Sheets...</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={isSync}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>📄</span>
              <span>{isSync ? 'Syncing...' : 'Sync Claims'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync History */}
      {loading && syncHistory.length === 0 ? (
        <TableSkeleton columns={3} title="Loading sync history" />
      ) : (
        <div className="relative bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sync History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {syncHistory.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No sync history available. Perform your first sync to see results here.
              </div>
            ) : (
              syncHistory.map((result, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 text-2xl">
                      {getStatusIcon(result.success)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${getStatusColor(result.success)}`}>{result.success ? 'Sync Successful' : 'Sync Failed'}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(result.timestamp)}</p>
                      </div>
                      <div className={`mt-2 p-3 rounded-md border ${getStatusBgColor(result.success)}`}>
                        <p className="text-sm text-gray-800">{result.message}</p>
                        {result.recordsSync > 0 && (
                          <p className="text-xs text-gray-600 mt-1">Records synced: {result.recordsSync}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {loading && syncHistory.length > 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-md">
              <LoadingSpinner size="md" text="Refreshing..." />
            </div>
          )}
        </div>
      )}

      {/* Configuration removed */}
    </div>
  );
};

export default SyncPage;
