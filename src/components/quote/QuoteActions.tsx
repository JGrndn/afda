'use client';

import { useState } from 'react';
import { Send, CheckCircle, XCircle, FileCheck, Ban } from 'lucide-react';
import { ConfirmModal } from '@/components/ui';
import { MarkInvoicePaidModal } from './MarkInvoicePaidModal';
import { ActionsDropdown } from '@/components/ui/ActionsDropdown';
import { ActionBar } from '@/components/ui/ActionBar';
import { useUpdateQuoteStatus, useIssueInvoice, useCancelInvoice } from '@/hooks/quote.hook';
import { QuoteWithDetailsDTO } from '@/lib/dto/quote.dto';
import { QUOTE_STATUS } from '@/lib/domain/enums/quote.enum';
import { QUOTE_INVOICE_STATUS } from '@/lib/domain/enums/quoteInvoice.enum';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { ErrorMessage } from '@/components/ui';

interface QuoteActionsProps {
  quote: QuoteWithDetailsDTO;
  userRole: UserRole;
  onMutate: () => void;
  editDeleteActions: { label: string; icon: any; onClick: () => void; variant?: 'danger'; hidden?: boolean }[];
}

export function QuoteActions({ quote, userRole, onMutate, editDeleteActions }: QuoteActionsProps) {
  const canUpdate = UserRolePermissions.canEdit(userRole);

  const { updateStatus, error: statusError } = useUpdateQuoteStatus();
  const { issue, isLoading: isIssuing, error: invoiceError } = useIssueInvoice();
  const { cancel, isLoading: isCancelling, error: cancelError } = useCancelInvoice();

  const [isConfirmInvoiceOpen, setIsConfirmInvoiceOpen] = useState(false);
  const [isConfirmCancelInvoiceOpen, setIsConfirmCancelInvoiceOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);

  const handleStatusChange = async (status: typeof QUOTE_STATUS[keyof typeof QUOTE_STATUS]) => {
    const result = await updateStatus(quote.id, status);
    if (result) onMutate();
  };

  const handleIssueInvoice = async () => {
    const inv = await issue(quote.id);
    if (inv) onMutate();
  };

  const handleCancelInvoice = async () => {
    if (!quote.invoice) return;
    const result = await cancel(quote.invoice.id);
    if (result) onMutate();
  };

  const statusActions = (() => {
    if (!canUpdate) return [];
    switch (quote.status) {
      case QUOTE_STATUS.DRAFT:
        return [{ label: 'Marquer envoyé', icon: Send, onClick: () => handleStatusChange(QUOTE_STATUS.SENT) }];
      case QUOTE_STATUS.SENT:
        return [
          { label: 'Accepté', icon: CheckCircle, onClick: () => handleStatusChange(QUOTE_STATUS.ACCEPTED) },
          { label: 'Refusé', icon: XCircle, onClick: () => handleStatusChange(QUOTE_STATUS.REJECTED), variant: 'danger' as const },
        ];
      case QUOTE_STATUS.ACCEPTED:
        return [{ label: 'Générer la facture', icon: FileCheck, onClick: () => setIsConfirmInvoiceOpen(true) }];
      default:
        return [];
    }
  })();

  const invoiceActions = (() => {
    if (!quote.invoice || !canUpdate) return [];
    if (quote.invoice.status === QUOTE_INVOICE_STATUS.ISSUED) {
      return [
        { label: 'Marquer payée', icon: CheckCircle, onClick: () => setIsMarkPaidOpen(true) },
        { label: 'Annuler la facture', icon: Ban, onClick: () => setIsConfirmCancelInvoiceOpen(true), variant: 'danger' as const },
      ];
    }
    return [];
  })();

  const allActions = [...statusActions, ...editDeleteActions];

  return (
    <>
      {(statusError || invoiceError || cancelError) && (
        <ErrorMessage error={(statusError || invoiceError || cancelError)!} />
      )}

      <ActionsDropdown items={allActions} />
      <ActionBar items={allActions} />

      {/* Actions facture inline dans la card — exposées via prop ou slot */}
      {invoiceActions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {invoiceActions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                a.variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              <a.icon className="w-4 h-4" />
              {a.label}
            </button>
          ))}
        </div>
      )}

      <ConfirmModal isOpen={isConfirmInvoiceOpen} title="Générer la facture" content="Cette action est irréversible. La facture sera créée définitivement." onClose={() => setIsConfirmInvoiceOpen(false)} onConfirm={handleIssueInvoice} />
      <ConfirmModal isOpen={isConfirmCancelInvoiceOpen} title="Annuler la facture" content="La facture sera annulée et le devis repassera en statut « Accepté »." onClose={() => setIsConfirmCancelInvoiceOpen(false)} onConfirm={handleCancelInvoice} />
      {quote.invoice && (
        <MarkInvoicePaidModal isOpen={isMarkPaidOpen} onClose={() => setIsMarkPaidOpen(false)} invoice={quote.invoice} onSuccess={() => { onMutate(); setIsMarkPaidOpen(false); }} />
      )}
    </>
  );
}