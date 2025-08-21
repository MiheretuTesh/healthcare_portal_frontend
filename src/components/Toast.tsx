'use client';

interface ToastProps {
  type: 'success' | 'error';
  text: string;
}

const Toast = ({ type, text }: ToastProps) => {
  const base = 'min-w-[260px] max-w-sm rounded-md shadow-lg px-4 py-3 border text-sm';
  const styles =
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800';

  return (
    <div className={`${base} ${styles}`}>{text}</div>
  );
};

export default Toast;


