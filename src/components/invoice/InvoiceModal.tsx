'use client';

import { useState, useCallback } from 'react';
import { X, FileCheck, Loader2 } from 'lucide-react';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';
import { Button } from '@/components/ui';
import { InvoicePdfViewer } from './InvoicePdfViewer';
import { issueInvoice } from '@/app/(app)/invoices/invoices.actions';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDTO;
  onInvoiceIssued?: (issued: InvoiceDTO) => void;
}

export function InvoiceModal({
  isOpen,
  onClose,
  invoice: initialInvoice,
  onInvoiceIssued,
}: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceDTO>(initialInvoice);
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDraft = invoice.status === 'draft';

  const handleIssue = useCallback(async () => {
    setIsIssuing(true);
    setError(null);
    try {
      const issued = await issueInvoice(invoice.familyId, invoice.seasonId);
      setInvoice(issued);
      onInvoiceIssued?.(issued);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setIsIssuing(false);
    }
  }, [invoice.familyId, invoice.seasonId, onInvoiceIssued]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col"
          style={{ maxHeight: '92vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {isDraft ? 'Aperçu de la facture (brouillon)' : 'Facture'}
              </h2>
              {!isDraft && invoice.invoiceNumber && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {invoice.invoiceNumber}
                </span>
              )}
              {isDraft && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  Brouillon
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isDraft && (
                <Button
                  onClick={handleIssue}
                  disabled={isIssuing}
                  Icon={isIssuing ? undefined : FileCheck}
                  size="sm"
                >
                  {isIssuing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Génération...
                    </>
                  ) : (
                    'Générer la facture'
                  )}
                </Button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex-shrink-0">
              {error}
            </div>
          )}

          {/* Draft info banner */}
          {isDraft && (
            <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex-shrink-0">
              <strong>Aperçu uniquement.</strong> Cette facture n'est pas encore générée. Cliquez sur
              "Générer la facture" pour la créer définitivement et lui attribuer un numéro.
            </div>
          )}

          {/* PDF Viewer */}
          <div className="flex-1 px-6 py-4 min-h-0 overflow-hidden">
            <InvoicePdfViewer invoice={invoice} height="calc(92vh - 160px)" />
          </div>
        </div>
      </div>
    </div>
  );
}