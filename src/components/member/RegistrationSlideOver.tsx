'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { RegistrationForm } from '@/components/member/RegistrationForm';
import { useRegistrationActions } from '@/hooks/registration.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateRegistrationInput } from '@/lib/schemas/registration.input';

interface RegistrationSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  memberId: number;
  seasonId: number;
  defaultDiscount?: number;
}

export function RegistrationSlideOver({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  seasonId,
  defaultDiscount=0
}: RegistrationSlideOverProps) {
  const { create, isLoading, error } = useRegistrationActions();

  const handleSubmit = async (data: CreateRegistrationInput) => {
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
      title="Nouvelle inscription"
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <RegistrationForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        memberId={memberId}
        seasonId={seasonId}
        defaultDiscount={defaultDiscount}
      />
    </SlideOver>
  );
}