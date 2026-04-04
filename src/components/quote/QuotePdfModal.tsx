'use client';

import { X } from 'lucide-react';
import { QuoteWithDetailsDTO } from '@/lib/dto/quote.dto';
import { QuotePdfViewer } from './QuotePdfViewer';
import { QuoteInvoicePdfViewer } from './QuoteInvoicePdfViewer';

interface QuotePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteWithDetailsDTO;
  /** Mode : afficher le devis ou la facture */
  mode: 'quote' | 'invoice';
  clientAddress?: string | null;
}

export function QuotePdfModal({
  isOpen,
  onClose,
  quote,
  mode,
  clientAddress,
}: QuotePdfModalProps) {
  if (!isOpen) return null;

  const isInvoice = mode === 'invoice';
  const title = isInvoice
    ? `Facture ${quote.invoice?.invoiceNumber ?? ''}`
    : `Devis ${quote.quoteNumber ?? ''}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col"
          style={{ maxHeight: '92vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PDF */}
          <div className="flex-1 px-6 py-4 min-h-0 overflow-hidden">
            {isInvoice ? (
              <QuoteInvoicePdfViewer
                quote={quote}
                clientAddress={clientAddress}
                height="calc(92vh - 100px)"
              />
            ) : (
              <QuotePdfViewer quote={quote} height="calc(92vh - 100px)" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}