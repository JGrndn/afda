'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, Send, CheckCircle, XCircle, FileText, FileCheck, Ban } from 'lucide-react';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { QuotePdfModal } from '@/components/quote/QuotePdfModal';
import { MarkInvoicePaidModal } from '@/components/quote/MarkInvoicePaidModal';
import { useQuote, useQuoteActions, useIssueInvoice, useCancelInvoice } from '@/hooks/quote.hook';
import { useClient } from '@/hooks/client.hook';
import { Button, Card, ErrorMessage, StatusBadge, ConfirmModal } from '@/components/ui';
import { ActionBar } from '@/components/ui/ActionBar';
import { ActionsDropdown } from '@/components/ui/ActionsDropdown';
import { QuoteWithDetailsDTO, QuoteItemDTO } from '@/lib/dto/quote.dto';
import { QUOTE_STATUS } from '@/lib/domain/enums/quote.enum';
import { QUOTE_INVOICE_STATUS } from '@/lib/domain/enums/quoteInvoice.enum';
import { UpdateQuoteInput } from '@/lib/schemas/quote.input';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface QuoteDetailPageClientProps {
  initialQuote: QuoteWithDetailsDTO;
  userRole: UserRole;
}

export function QuoteDetailPageClient({ initialQuote, userRole }: QuoteDetailPageClientProps) {
  const router = useRouter();
  const { quote, mutate } = useQuote(initialQuote.id);
  const { update, remove, isLoading: mutationLoading, error } = useQuoteActions();
  const { issue, isLoading: isIssuing, error: invoiceError } = useIssueInvoice();
  const { cancel, isLoading: isCancelling, error: cancelError } = useCancelInvoice();

  const data = quote ?? initialQuote;
  const { client } = useClient(initialQuote.clientId);

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmInvoiceOpen, setIsConfirmInvoiceOpen] = useState(false);
  const [isConfirmCancelInvoiceOpen, setIsConfirmCancelInvoiceOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [pdfModal, setPdfModal] = useState<'quote' | 'invoice' | null>(null);

  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);
  const isLocked = data.status === QUOTE_STATUS.REJECTED;
  const isInvoiced = data.status === QUOTE_STATUS.INVOICED;

  const handleStatusChange = async (status: UpdateQuoteInput['status']) => {
    await update(data.id, { status });
    mutate();
  };

  const handleDelete = async () => {
    await remove(data.id);
    router.push('/quotes');
  };

  const handleIssueInvoice = async () => {
    const inv = await issue(data.id);
    if (inv) mutate();
  };

  const handleCancelInvoice = async () => {
    if (!data.invoice) return;
    const result = await cancel(data.invoice.id);
    if (result) mutate();
  };

  // Actions devis selon statut — variables simples, pas de useMemo
  const quoteStatusActions = (() => {
    if (!canUpdate) return [];
    switch (data.status) {
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

  const editDeleteActions = [
    { label: 'Modifier', icon: Pencil, onClick: () => setIsEditing(true), hidden: !canUpdate || isEditing || isLocked || isInvoiced },
    { label: 'Supprimer', icon: Trash2, onClick: () => setIsConfirmDeleteOpen(true), variant: 'danger' as const, hidden: !canDelete || isLocked || isInvoiced },
  ];

  const allActions = [...quoteStatusActions, ...editDeleteActions];

  const invoiceActions = (() => {
    if (!data.invoice || !canUpdate) return [];
    if (data.invoice.status === QUOTE_INVOICE_STATUS.ISSUED) {
      return [
        { label: 'Marquer payée', icon: CheckCircle, onClick: () => setIsMarkPaidOpen(true) },
        { label: 'Annuler la facture', icon: Ban, onClick: () => setIsConfirmCancelInvoiceOpen(true), variant: 'danger' as const },
      ];
    }
    return [];
  })();

  return (
    <div className="container mx-auto p-6 max-w-6xl pb-24 sm:pb-6">
      <Link href="/quotes" className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <StatusBadge type="quote" status={data.status} />
        </div>
        <div className="flex items-center gap-2">
          {/* PDF devis toujours visible */}
          <Button size="sm" variant="secondary" Icon={FileText} onClick={() => setPdfModal('quote')}>
            PDF devis
          </Button>
          {/* PDF facture si disponible */}
          {data.invoice && (
            <Button size="sm" variant="secondary" Icon={FileText} onClick={() => setPdfModal('invoice')}>
              PDF facture
            </Button>
          )}
          {/* Dropdown ⋮ desktop */}
          {!isEditing && <ActionsDropdown items={allActions} />}
        </div>
      </div>

      {(error || invoiceError || cancelError) && <ErrorMessage error={(error || invoiceError || cancelError)!} />}

      {isEditing ? (
        <QuoteForm
          initialData={data}
          onSubmit={async (input) => { await update(data.id, input); setIsEditing(false); mutate(); }}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
          clientId={data.clientId}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Informations">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link href={`/clients/${data.clientId}`} className="text-blue-600 hover:underline">{data.clientName}</Link>
                </dd>
              </div>
              <div><dt className="text-sm font-medium text-gray-500">N° devis</dt><dd className="mt-1 text-sm text-gray-900">{data.quoteNumber ?? '—'}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500">Émis le</dt><dd className="mt-1 text-sm text-gray-900">{data.issuedAt ? new Date(data.issuedAt).toLocaleDateString('fr-FR') : '—'}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500">Valable jusqu'au</dt><dd className="mt-1 text-sm text-gray-900">{data.validUntil ? new Date(data.validUntil).toLocaleDateString('fr-FR') : '—'}</dd></div>
              {data.description && (
                <div className="md:col-span-3"><dt className="text-sm font-medium text-gray-500">Description</dt><dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{data.description}</dd></div>
              )}
            </dl>
          </Card>

          {data.invoice && (
            <Card title="Facture">
              <div className="flex flex-col gap-4">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><dt className="text-sm font-medium text-gray-500">N° facture</dt><dd className="mt-1 text-sm font-semibold text-gray-900">{data.invoice.invoiceNumber}</dd></div>
                  <div><dt className="text-sm font-medium text-gray-500">Statut</dt><dd className="mt-1"><StatusBadge type="quoteInvoice" status={data.invoice.status} /></dd></div>
                  <div><dt className="text-sm font-medium text-gray-500">Émise le</dt><dd className="mt-1 text-sm text-gray-900">{new Date(data.invoice.issuedAt).toLocaleDateString('fr-FR')}</dd></div>
                  {data.invoice.paidAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payée le</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(data.invoice.paidAt).toLocaleDateString('fr-FR')}
                        {data.invoice.paymentMethod && <span className="ml-2 text-xs text-gray-400">({data.invoice.paymentMethod})</span>}
                      </dd>
                    </div>
                  )}
                </dl>
                {/* Actions facture — visibles sur toutes les tailles */}
                {invoiceActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {invoiceActions.map((a, i) => (
                      <Button key={i} size="sm" variant={a.variant === 'danger' ? 'danger' : 'secondary'} Icon={a.icon} onClick={a.onClick}>
                        {a.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card title="Lignes du devis">
            {/* Mobile : layout 2 colonnes */}
            <div className="sm:hidden divide-y divide-gray-100">
              {data.items.map((item: QuoteItemDTO, i: number) => (
                <div key={i} className="flex items-start justify-between gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{item.quantity} × {item.unitPrice.toFixed(2)} €</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{item.lineTotal.toFixed(2)} €</p>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-semibold text-gray-900">
                <span>Total HT</span>
                <span>{data.totalAmount.toFixed(2)} €</span>
              </div>
            </div>

            {/* Desktop : tableau classique */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Libellé', 'Prix unit.', 'Qté', 'Total'].map((h) => (
                      <th key={h} className={`px-4 py-2 font-medium text-gray-500 uppercase text-xs tracking-wider ${h === 'Libellé' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.items.map((item: QuoteItemDTO, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-900">
                        <div>{item.label}</div>
                        {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">{item.unitPrice.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{item.lineTotal.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">Total HT</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 text-base">{data.totalAmount.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {data.notes && (
            <Card title="Notes"><p className="text-sm text-gray-700 whitespace-pre-line">{data.notes}</p></Card>
          )}
        </div>
      )}

      {pdfModal && (
        <QuotePdfModal isOpen onClose={() => setPdfModal(null)} quote={data} mode={pdfModal} clientAddress={client?.address} />
      )}

      {data.invoice && (
        <MarkInvoicePaidModal isOpen={isMarkPaidOpen} onClose={() => setIsMarkPaidOpen(false)} invoice={data.invoice} onSuccess={() => { mutate(); setIsMarkPaidOpen(false); }} />
      )}

      {/* Mobile uniquement — actions devis + edit/delete */}
      <ActionBar items={allActions} />

      <ConfirmModal isOpen={isConfirmDeleteOpen} title="Supprimer le devis" content="Êtes-vous sûr de vouloir supprimer ce devis ?" onClose={() => setIsConfirmDeleteOpen(false)} onConfirm={handleDelete} />
      <ConfirmModal isOpen={isConfirmInvoiceOpen} title="Générer la facture" content="Cette action est irréversible. La facture sera créée définitivement." onClose={() => setIsConfirmInvoiceOpen(false)} onConfirm={handleIssueInvoice} />
      <ConfirmModal isOpen={isConfirmCancelInvoiceOpen} title="Annuler la facture" content="La facture sera annulée et le devis repassera en statut « Accepté »." onClose={() => setIsConfirmCancelInvoiceOpen(false)} onConfirm={handleCancelInvoice} />
    </div>
  );
}