import { QuoteInvoiceStatus, QUOTE_INVOICE_STATUS } from '@/lib/domain/enums/quoteInvoice.enum';

interface InvoiceStatusCellProps {
  invoiceStatus: QuoteInvoiceStatus | null;
  invoicePaidAt: Date | null;
}

export function InvoiceStatusCell({ invoiceStatus, invoicePaidAt }: InvoiceStatusCellProps) {
  if (!invoiceStatus) {
    return <span className="text-xs text-gray-400">Non générée</span>;
  }

  if (invoiceStatus === QUOTE_INVOICE_STATUS.PAID) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Payée
        </span>
        {invoicePaidAt && (
          <span className="text-xs text-gray-400">
            {new Date(invoicePaidAt).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
    );
  }

  if (invoiceStatus === QUOTE_INVOICE_STATUS.ISSUED) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
        En attente
      </span>
    );
  }

  // cancelled
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
      Annulée
    </span>
  );
}