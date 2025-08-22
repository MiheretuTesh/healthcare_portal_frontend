'use client';

import { useState } from 'react';
import { CreatePatientRequest } from '@/types/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PatientFormProps {
  onSubmit: (data: CreatePatientRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PatientForm = ({ onSubmit, onCancel, isLoading = false }: PatientFormProps) => {
  const [formData, setFormData] = useState<CreatePatientRequest>({
    name: '',
    email: '',
    phone: '',
    insuranceProvider: '',
  });
  const [errors, setErrors] = useState<Partial<CreatePatientRequest>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreatePatientRequest> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.insuranceProvider.trim()) {
      newErrors.insuranceProvider = 'Insurance provider is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Form will be closed by parent component on success
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create patient';
      setApiError(errorMessage);
    }
  };

  const handleChange = (field: keyof CreatePatientRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', animation: 'fadeIn 0.2s ease-out' }}
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
        style={{ animation: 'modalSlideIn 0.3s ease-out' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Patient</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-md text-black ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter patient name"
                autoFocus
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-md text-black ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-md text-black ${
                  errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Provider *
              </label>
              <input
                type="text"
                id="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-md text-black ${
                  errors.insuranceProvider ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Enter insurance provider"
              />
              {errors.insuranceProvider && <p className="mt-1 text-sm text-red-600">{errors.insuranceProvider}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
