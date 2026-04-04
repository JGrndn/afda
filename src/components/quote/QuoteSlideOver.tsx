'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { useQuoteActions } from '@/hooks/quote.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateQuoteInput } from '@/lib/schemas/quote.input';

interface QuoteSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Pré-sélectionner un client depuis la page détail client */
  clientId?: number;
}

export function QuoteSlideOver({
  isOpen,
  onClose,
  onSuccess,
  clientId,
}: QuoteSlideOverProps) {
  const { create, isLoading, error } = useQuoteActions();

  const handleSubmit = async (data: CreateQuoteInput) => {
    const result = await create(data);
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Nouveau devis" size="lg">
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <QuoteForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        clientId={clientId}
      />
    </SlideOver>
  );
}