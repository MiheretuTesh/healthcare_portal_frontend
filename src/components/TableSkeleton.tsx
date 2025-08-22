'use client';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  title?: string;
}

const TableSkeleton = ({ columns, rows = 6, title }: TableSkeletonProps) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {title && (
        <div className="px-4 py-5 sm:px-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="px-6 py-4">
                    <div className="h-4 w-full max-w-[220px] bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;


