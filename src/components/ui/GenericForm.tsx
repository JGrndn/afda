import { ReactNode } from 'react';

interface GenericFormProps {
  title?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

export function GenericForm({
  title,
  onSubmit,
  onCancel,
  isLoading,
  children,
  submitLabel = 'Sauvegarder',
  cancelLabel = 'Annuler',
}: GenericFormProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
      )}

      <form onSubmit={onSubmit}>
        {children}

        <div className="flex gap-3 mt-6 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}