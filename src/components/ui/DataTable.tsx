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

interface DataTableProps<
  T extends Record<string, unknown>
> {
  data?: T[] | null;
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<
  T extends Record<string, unknown>
>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
}: DataTableProps<T>) {
  
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIndex) => {
            return (
              <tr
                key={`row_${rowIndex}`}
                className={`${onRowClick ? 'hover:bg-gray-50' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col, colIndex) => {
                  return(
                    <td
                      key={`cell_${rowIndex}_${colIndex}`}
                      className="px-6 py-4 text-sm text-gray-900"
                    >
                      <div className="whitespace-nowrap">
                        {col.type === 'field' ? (
                          col.render ? col.render(item) : String(item[col.key])
                        ) : (
                          col.render(item)
                        )}
                      </div>
                    </td>
                  )}
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
