'use client';

import { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import { QuotePdfModal } from '@/components/quote/QuotePdfModal';
import { QuoteWithDetailsDTO } from '@/lib/dto/quote.dto';
import { QuoteInvoiceWithDetailsDTO } from '@/lib/dto/quoteInvoice.dto';

interface QuoteInvoicePdfButtonProps {
  invoice: QuoteInvoiceWithDetailsDTO;
}

export function QuoteInvoicePdfButton({ invoice }: QuoteInvoicePdfButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quote, setQuote] = useState<QuoteWithDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = useCallback(async () => {
    // Si on a déjà chargé le devis, ouvrir directement
    if (quote) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/quotes/${invoice.quoteId}`);
      if (!res.ok) throw new Error('Impossible de charger la facture');
      const data: QuoteWithDetailsDTO = await res.json();
      setQuote(data);
      setIsOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  }, [quote, invoice.quoteId]);

  return (
    <>
      <Button
        size="icon"
        variant="soft"
        Icon={FileText}
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        isLoading={isLoading}
        title="Voir la facture PDF"
      />

      {error && (
        <span className="text-xs text-red-500 ml-1">{error}</span>
      )}

      {quote && (
        <QuotePdfModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          quote={quote}
          mode="invoice"
          clientAddress={quote.invoice ? undefined : null}
        />
      )}
    </>
  );
}