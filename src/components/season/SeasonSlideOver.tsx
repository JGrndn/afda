'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { SeasonForm } from '@/components/season/SeasonForm';
import { useSeasonActions } from '@/hooks/season.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateSeasonInput } from '@/lib/schemas/season.input';

interface SeasonSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SeasonSlideOver({
  isOpen,
  onClose,
  onSuccess,
}: SeasonSlideOverProps) {
  const { create, isLoading, error } = useSeasonActions();

  const handleSubmit = async (data: CreateSeasonInput) => {
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
      title="Nouvelle famille"
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <SeasonForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </SlideOver>
  );
}