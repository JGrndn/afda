import { ReactNode } from 'react';

type FieldColumn<T, K extends keyof T> = {
  type: 'field';
  key: K;
  label: string;
  render?: (item: T) => ReactNode;
}

type ComputedColumn<T> = {
  type: 'computed';
  label: string;
  render: (item: T) => ReactNode;
};

type ActionColumn<T> = {
  type: 'action';
  label: string;
  render: (item: T) => ReactNode;
}

export type Column<T> =
  | FieldColumn<T, keyof T>
  | ComputedColumn<T>
  | ActionColumn<T>;

interface DataTableProps<T extends Record<string, unknown>> {
  data?: T[] | null;
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
}: DataTableProps<T>) {

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const dataColumns = columns.filter((c) => c.type !== 'action');
  const actionColumns = columns.filter((c) => c.type === 'action');

  function getCellValue(col: Column<T>, item: T): ReactNode {
    if (col.type === 'field') {
      return col.render ? col.render(item) : String(item[col.key] ?? '');
    }
    return col.render(item);
  }

  return (
    <>
      {/* ── Mode carte (mobile) ── */}
      <div className="sm:hidden space-y-3">
        {data.map((item, rowIndex) => (
          <div
            key={rowIndex}
            className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${
              onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
            }`}
            onClick={() => onRowClick?.(item)}
          >
            <div className="divide-y divide-gray-50">
              {dataColumns.map((col, colIndex) => (
                <div key={colIndex} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex-shrink-0 w-28">
                    {col.label}
                  </span>
                  <span className="text-sm text-gray-900 text-right">
                    {getCellValue(col, item)}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions en bas de la carte */}
            {actionColumns.length > 0 && (
              <div
                className="flex gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                {actionColumns.map((col, i) => (
                  <div key={i}>{col.render(item)}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Mode tableau (desktop) ── */}
      <div className="hidden sm:block bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm text-gray-900">
                      <div className="whitespace-nowrap">
                        {getCellValue(col, item)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}