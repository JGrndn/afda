'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { WorkshopForm } from '@/components/workshop/WorkshopForm';
import { useWorkshopActions } from '@/hooks/workshop.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateWorkshopInput } from '@/lib/schemas/workshop.input';

interface WorkshopSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WorkshopSlideOver({
  isOpen,
  onClose,
  onSuccess,
}: WorkshopSlideOverProps) {
  const { create, isLoading, error } = useWorkshopActions();

  const handleSubmit = async (data: CreateWorkshopInput) => {
    const result = await create({...data});
    
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvel atelier"
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <WorkshopForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </SlideOver>
  );
}