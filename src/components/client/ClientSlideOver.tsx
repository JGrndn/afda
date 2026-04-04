'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { ClientForm } from '@/components/client/ClientForm';
import { useClientActions } from '@/hooks/client.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateClientInput } from '@/lib/schemas/client.input';

interface ClientSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClientSlideOver({ isOpen, onClose, onSuccess }: ClientSlideOverProps) {
  const { create, isLoading, error } = useClientActions();

  const handleSubmit = async (data: CreateClientInput) => {
    const result = await create(data);
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Nouveau client" size="md">
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <ClientForm onSubmit={handleSubmit} onCancel={onClose} isLoading={isLoading} />
    </SlideOver>
  );
}