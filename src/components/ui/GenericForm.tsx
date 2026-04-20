import { ReactNode } from 'react';
import { Button } from './Button';

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
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">{title}</h2>
      )}

      <form onSubmit={onSubmit}>
        {children}

        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}