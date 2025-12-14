import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export function Table<T extends { _id: string }>({
  data,
  columns,
  onRowClick,
  loading,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className='card p-8'>
        <div className='flex items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='card p-8 text-center text-gray-500'>
        No data available
      </div>
    );
  }

  return (
    <div className='card overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {data.map((row) => (
              <tr
                key={row._id}
                onClick={() => onRowClick?.(row)}
                className={
                  onRowClick
                    ? 'cursor-pointer hover:bg-gray-50 transition-colors'
                    : ''
                }
              >
                {columns.map((column, idx) => (
                  <td
                    key={idx}
                    className={`px-6 py-4 whitespace-nowrap ${
                      column.className || ''
                    }`}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : String(row[column.accessor] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
