'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { FamilyForm } from '@/components/family/FamilyForm';
import { useFamilyActions } from '@/hooks/family.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateFamilyInput } from '@/lib/schemas/family.input';

interface FamilySlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FamilySlideOver({
  isOpen,
  onClose,
  onSuccess,
}: FamilySlideOverProps) {
  const { create, isLoading, error } = useFamilyActions();

  const handleSubmit = async (data: CreateFamilyInput) => {
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
      <FamilyForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </SlideOver>
  );
}