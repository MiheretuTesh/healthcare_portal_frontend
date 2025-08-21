'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Patient } from '@/types';
import { usePatient } from '@/contexts/AppProvider';
import PatientForm from '@/components/PatientForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CreatePatientRequest } from '@/types/api';
import { showToast } from '@/lib/utils';

const PatientsPage = () => {
  const { state, actions } = usePatient();
  const { patients, loading, error } = state;
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    actions.fetchPatients();
  }, [actions]);

  const handleAddPatient = async (patientData: CreatePatientRequest) => {
    setIsSubmitting(true);
    try {
      const newPatient = await actions.createPatient(patientData);
      if (newPatient) {
        setShowForm(false);
        showToast('success', 'Patient added successfully!');
      } else {
        showToast('error', 'Failed to add patient. Please try again.');
      }
    } catch (error: any) {
      showToast('error', error?.message || 'Failed to add patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading patients..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patients</h1>
        <p className="text-gray-600">Manage patient information and view their claims</p>
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

      {/* Add Patient Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Patient
        </button>
      </div>

      {/* Patients Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Patient List ({patients.length})
          </h3>
        </div>
        
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No patients found. Add your first patient to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance Provider
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                        {patient.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.insuranceProvider}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Form Modal */}
      {showForm && (
        <PatientForm
          onSubmit={handleAddPatient}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default PatientsPage;
