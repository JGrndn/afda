'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, ErrorMessage, FormField } from '@/components/ui';
import { useMarkInvoicePaid } from '@/hooks/quote.hook';
import { QuoteInvoiceDTO } from '@/lib/dto/quote.dto';
import { QUOTE_INVOICE_PAYMENT_METHOD } from '@/lib/domain/enums/quoteInvoice.enum';

interface MarkInvoicePaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: QuoteInvoiceDTO;
  onSuccess?: () => void;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: QUOTE_INVOICE_PAYMENT_METHOD.TRANSFER, label: 'Virement' },
  { value: QUOTE_INVOICE_PAYMENT_METHOD.CHECK, label: 'Chèque' },
  { value: QUOTE_INVOICE_PAYMENT_METHOD.CASH, label: 'Espèces' },
  { value: QUOTE_INVOICE_PAYMENT_METHOD.CARD, label: 'Carte bancaire' },
];

export function MarkInvoicePaidModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: MarkInvoicePaidModalProps) {
  const { markPaid, isLoading, error } = useMarkInvoicePaid();

  const today = new Date().toISOString().split('T')[0];
  const [paidAt, setPaidAt] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState(
    QUOTE_INVOICE_PAYMENT_METHOD.TRANSFER
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await markPaid(invoice.id, {
      paidAt: new Date(paidAt),
      paymentMethod,
    });
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer le paiement" size="sm">
      {error && (
        <div className="mb-4">
          <ErrorMessage error={error} />
        </div>
      )}

      {/* Récapitulatif */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Facture</span>
          <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Montant</span>
          <span className="text-lg font-bold text-gray-900">
            {invoice.totalAmount.toFixed(2)} €
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Mode de règlement"
          name="paymentMethod"
          type="select"
          value={paymentMethod}
          onChange={(v) => setPaymentMethod(v)}
          options={PAYMENT_METHOD_OPTIONS}
          required
        />

        <FormField
          label="Date d'encaissement"
          name="paidAt"
          type="date"
          value={paidAt}
          onChange={(v) => setPaidAt(v)}
          required
        />

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
            Icon={CreditCard}
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}