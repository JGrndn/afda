import { ReactNode, useState } from 'react';
import { FormField } from '@/components/ui';
import { Check, Edit2, X } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  editable?: boolean;
  editor?: (props: {
    value: any;
    onChange: (value: any) => void;
    row: T;
    error?: string;
  }) => ReactNode;
  validator?: (value: any, row: T) => string | null;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isEditable?:boolean;
  onRowClick?: (item: T) => void;
  onRowSave?: (id: number, item: Partial<T>) => Promise<void>;
  emptyMessage?: string;
  isLoading?: boolean;
  idKey?: keyof T;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isEditable = false,
  onRowClick,
  onRowSave,
  emptyMessage = 'Aucune donnée disponible',
  isLoading,
  idKey = 'id' as keyof T,
}: DataTableProps<T>) {
  const [editingId, setEditingId] = useState<any>(null);
  const [editedData, setEditedData] = useState<Partial<T>>({});
  const [originalData, setOriginalData] = useState<T|null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleEdit = (item: T) => {
    setEditingId(item[idKey]);
    setOriginalData(item);
    setEditedData({ ...item });
    setErrors({});
  };

  const getUpdatedFields = () => {
    if (!originalData) return editedData;

    const result: Partial<T> = {};
    (Object.keys(editedData) as (keyof T)[]).forEach((key) => {
      if (editedData[key] !== originalData[key]) {
        result[key] = editedData[key];
      }
    });
    return result;
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
    setErrors({});
  };

  const handleCellChange = (key: string, value: any) => {
    const newData = { ...editedData, [key]: value };
    setEditedData(newData);
    
    // Valider le champ
    const column = columns.find(col => col.key === key);
    if (column?.validator) {
      const error = column.validator(value, newData as T);
      setErrors(prev => ({
        ...prev,
        [key]: error || ''
      }));
    }
  };

  const handleSave = async () => {
    // Validation globale
    const newErrors: Record<string, string> = {};
    columns.forEach(col => {
      if (col.validator && col.editable) {
        const error = col.validator(editedData[col.key], editedData as T);
        if (error) {
          newErrors[col.key] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onRowSave) {
      setSaving(true);
      try {
        await onRowSave(editingId, getUpdatedFields() as T);
        setEditingId(null);
        setEditedData({});
        setErrors({});
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (data.length === 0) {
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
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {isEditable && (<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>)}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => {
            const isEditing = editingId === item[idKey];
            const displayData = isEditing ? editedData : item;

            return (
              <tr
                key={item[idKey]}
                className={`${
                  isEditing ? 'bg-blue-50' : onRowClick ? 'hover:bg-gray-50' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 text-sm text-gray-900"
                    onClick={() => !isEditing && onRowClick?.(item)}
                  >
                    {isEditing && col.editable ? (
                      col.editor ? (
                        col.editor({
                          value: displayData[col.key],
                          onChange: (value) => handleCellChange(col.key, value),
                          row: displayData as T,
                          error: errors[col.key]
                        })
                      ) : (
                        <FormField
                          compact
                          value={displayData[col.key]}
                          onChange={(value) => handleCellChange(col.key, value)}
                          error={errors[col.key]}
                        />
                      )
                    ) : (
                      <div className="whitespace-nowrap">
                        {col.render ? col.render(displayData as T) : displayData[col.key]}
                      </div>
                    )}
                  </td>
                ))}
                {isEditable && (<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        title="Sauvegarder"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Annuler"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Éditer"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  )}
                </td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
