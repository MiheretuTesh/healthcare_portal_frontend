// Utility functions

/**
 * Format a date string consistently for SSR compatibility
 * Uses a fixed format to prevent hydration mismatches
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  // Example: Jun 11, 2025
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

/**
 * Format a date string with time for SSR compatibility
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  // Example: Jun 11, 2025, 05:30 PM
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Simple toast helper to render into #toast-root
export const showToast = (type: 'success' | 'error', text: string, timeoutMs = 3000) => {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'animate-[fadeIn_0.2s_ease-out]';
  el.innerHTML = `<div class="min-w-[260px] max-w-sm rounded-md shadow-lg px-4 py-3 border text-sm ${
    type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
  }">${text}</div>`;
  root.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) root.removeChild(el);
  }, timeoutMs);
};
