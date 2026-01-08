'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { WorkshopPriceForm } from '@/components/workshop/WorkshopPriceForm';
import { useWorkshopPriceActions } from '@/hooks/workshopPrice.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateWorkshopPriceInput } from '@/lib/schemas/workshop.input';

interface WorkshopPriceSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  seasonId?: number;
  worshopId?: number;
}

export function WorkshopPriceSlideOver({
  isOpen,
  onClose,
  onSuccess,
  seasonId,
  worshopId,
}: WorkshopPriceSlideOverProps) {
  const { create, isLoading, error } = useWorkshopPriceActions();

  const handleSubmit = async (data: CreateWorkshopPriceInput) => {
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
      title="Nouvel prix"
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <WorkshopPriceForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        seasonId={seasonId}
        workshopId={worshopId}
      />
    </SlideOver>
  );
}