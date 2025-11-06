'use client';

interface TableCell {
  key: string | number;
  content: React.ReactNode;
  isSortable?: boolean;
}

interface TableHead {
  cells: TableCell[];
}

interface TableRow {
  key: string;
  cells: TableCell[];
}

interface CustomTableProps {
  head: TableHead;
  rows: TableRow[];
  isLoading: boolean;
  emptyView: React.ReactNode;
  onSort?: (key: string) => void;
}

export function CustomTable({ head, rows, isLoading, emptyView, onSort }: CustomTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className="py-8">{emptyView}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <thead className="bg-amber-50">
          <tr>
            {head.cells.map((cell, index) => (
              <th
                key={cell.key || index}
                className={`px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider ${
                  cell.isSortable ? 'cursor-pointer hover:bg-amber-100' : ''
                }`}
                onClick={() => cell.isSortable && onSort && onSort(String(cell.key))}
              >
                <div className="flex items-center space-x-1">
                  <span>{cell.content}</span>
                  {cell.isSortable && (
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-amber-50 transition-colors">
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cell.key || cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

