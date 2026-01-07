'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { usePaymentActions } from '@/hooks/payment.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreatePaymentInput } from '@/lib/schemas/payment.input';

interface PaymentSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: number;
  seasonId: number;
  onSuccess?: () => void;
}

export function PaymentSlideOver({
  isOpen,
  onClose,
  familyId,
  seasonId,
  onSuccess,
}: PaymentSlideOverProps) {
  const { create, isLoading, error } = usePaymentActions();

  const handleSubmit = async (data: CreatePaymentInput) => {
    const result = await create({ ...data, familyId, seasonId });
    
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau paiement"
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <PaymentForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </SlideOver>
  );
}