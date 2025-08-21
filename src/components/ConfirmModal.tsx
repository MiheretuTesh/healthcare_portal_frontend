'use client';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  confirmColor?: 'blue' | 'red' | 'yellow' | 'green';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const colorToBtn = {
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  yellow: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmColor = 'blue',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', animation: 'fadeIn 0.2s ease-out' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto transform transition-all"
        style={{ animation: 'modalSlideIn 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {message && <p className="text-gray-600 mb-4">{message}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${colorToBtn[confirmColor]}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


