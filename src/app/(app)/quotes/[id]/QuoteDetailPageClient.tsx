'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Pencil, Trash2, Send, CheckCircle,
  XCircle, FileText, FileCheck, Ban,
} from 'lucide-react';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { QuotePdfModal } from '@/components/quote/QuotePdfModal';
import { MarkInvoicePaidModal } from '@/components/quote/MarkInvoicePaidModal';
import { useQuote, useQuoteActions, useIssueInvoice, useCancelInvoice } from '@/hooks/quote.hook';
import { useClient } from '@/hooks/client.hook';
import { Button, Card, ErrorMessage, StatusBadge, ConfirmModal } from '@/components/ui';
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
  const { client } = useClient(data.clientId);

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmInvoiceOpen, setIsConfirmInvoiceOpen] = useState(false);
  const [isConfirmCancelInvoiceOpen, setIsConfirmCancelInvoiceOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [pdfModal, setPdfModal] = useState<'quote' | 'invoice' | null>(null);

  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);
  const isLocked = data.status === QUOTE_STATUS.REJECTED;

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

  // ── Boutons d'action selon statut du devis ─────────────
  const quoteActionButtons = useMemo(() => {
    const pdfQuoteBtn = (
      <Button size="sm" variant="secondary" Icon={FileText} onClick={() => setPdfModal('quote')}>
        PDF devis
      </Button>
    );

    if (!canUpdate) return pdfQuoteBtn;

    switch (data.status) {
      case QUOTE_STATUS.DRAFT:
        return (
          <div className="flex gap-2 flex-wrap">
            {pdfQuoteBtn}
            <Button size="sm" Icon={Send} onClick={() => handleStatusChange(QUOTE_STATUS.SENT)} isLoading={mutationLoading}>
              Marquer envoyé
            </Button>
          </div>
        );
      case QUOTE_STATUS.SENT:
        return (
          <div className="flex gap-2 flex-wrap">
            {pdfQuoteBtn}
            <Button size="sm" Icon={CheckCircle} onClick={() => handleStatusChange(QUOTE_STATUS.ACCEPTED)} isLoading={mutationLoading}>
              Accepté
            </Button>
            <Button size="sm" variant="danger" Icon={XCircle} onClick={() => handleStatusChange(QUOTE_STATUS.REJECTED)} isLoading={mutationLoading}>
              Refusé
            </Button>
          </div>
        );
      case QUOTE_STATUS.ACCEPTED:
        return (
          <div className="flex gap-2 flex-wrap">
            {pdfQuoteBtn}
            <Button size="sm" Icon={FileCheck} onClick={() => setIsConfirmInvoiceOpen(true)} isLoading={isIssuing}>
              Générer la facture
            </Button>
          </div>
        );
      case QUOTE_STATUS.INVOICED:
      case QUOTE_STATUS.REJECTED:
        return pdfQuoteBtn;
      default:
        return null;
    }
  }, [data.status, canUpdate, mutationLoading, isIssuing]);

  // ── Boutons d'action sur la facture ────────────────────
  const invoiceActionButtons = useMemo(() => {
    if (!data.invoice) return null;
    const inv = data.invoice;

    const pdfInvoiceBtn = (
      <Button size="sm" variant="secondary" Icon={FileText} onClick={() => setPdfModal('invoice')}>
        PDF facture
      </Button>
    );

    if (inv.status === QUOTE_INVOICE_STATUS.PAID) {
      return (
        <div className="flex gap-2 flex-wrap">
          {pdfInvoiceBtn}
          <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md">
            ✓ Payée le {new Date(inv.paidAt!).toLocaleDateString('fr-FR')}
          </span>
        </div>
      );
    }

    if (inv.status === QUOTE_INVOICE_STATUS.CANCELLED) {
      return pdfInvoiceBtn;
    }

    // issued
    return (
      <div className="flex gap-2 flex-wrap">
        {pdfInvoiceBtn}
        {canUpdate && (
          <>
            <Button size="sm" Icon={CheckCircle} onClick={() => setIsMarkPaidOpen(true)}>
              Marquer payée
            </Button>
            <Button size="sm" variant="danger" Icon={Ban} onClick={() => setIsConfirmCancelInvoiceOpen(true)} isLoading={isCancelling}>
              Annuler la facture
            </Button>
          </>
        )}
      </div>
    );
  }, [data.invoice, canUpdate, isCancelling]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link href="/quotes" className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <StatusBadge type="quote" status={data.status} />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {quoteActionButtons}
          {!isEditing && !isLocked && data.status !== QUOTE_STATUS.INVOICED && canUpdate && (
            <Button onClick={() => setIsEditing(true)} Icon={Pencil} />
          )}
          {!isLocked && data.status !== QUOTE_STATUS.INVOICED && canDelete && (
            <Button variant="danger" onClick={() => setIsConfirmDeleteOpen(true)} Icon={Trash2} />
          )}
        </div>
      </div>

      {(error || invoiceError || cancelError) && (
        <ErrorMessage error={(error || invoiceError || cancelError)!} />
      )}

      {isEditing ? (
        <QuoteForm
          initialData={data}
          onSubmit={async (input) => {
            await update(data.id, input);
            setIsEditing(false);
            mutate();
          }}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
          clientId={data.clientId}
        />
      ) : (
        <div className="space-y-6">
          {/* Métadonnées devis */}
          <Card title="Informations">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link href={`/clients/${data.clientId}`} className="text-blue-600 hover:underline">
                    {data.clientName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">N° devis</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.quoteNumber ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Émis le</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {data.issuedAt ? new Date(data.issuedAt).toLocaleDateString('fr-FR') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Valable jusqu'au</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {data.validUntil ? new Date(data.validUntil).toLocaleDateString('fr-FR') : '—'}
                </dd>
              </div>
              {data.description && (
                <div className="md:col-span-3">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{data.description}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Bloc facture */}
          {data.invoice && (
            <Card title="Facture">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">N° facture</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{data.invoice.invoiceNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="mt-1">
                      <StatusBadge type="quoteInvoice" status={data.invoice.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Émise le</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(data.invoice.issuedAt).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                  {data.invoice.paidAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payée le</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(data.invoice.paidAt).toLocaleDateString('fr-FR')}
                        {data.invoice.paymentMethod && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({data.invoice.paymentMethod})
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="flex-shrink-0">{invoiceActionButtons}</div>
              </div>
            </Card>
          )}

          {/* Lignes */}
          <Card title="Lignes du devis">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Libellé', 'Prix unit.', 'Qté', 'Total'].map((h) => (
                      <th key={h} className={`px-4 py-2 font-medium text-gray-500 uppercase text-xs tracking-wider ${h === 'Libellé' ? 'text-left' : 'text-right'}`}>
                        {h}
                      </th>
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
            <Card title="Notes">
              <p className="text-sm text-gray-700 whitespace-pre-line">{data.notes}</p>
            </Card>
          )}
        </div>
      )}

      {/* PDF Modal */}
      {pdfModal && (
        <QuotePdfModal
          isOpen
          onClose={() => setPdfModal(null)}
          quote={data}
          mode={pdfModal}
          clientAddress={client?.address}
        />
      )}

      {/* Mark paid Modal */}
      {data.invoice && (
        <MarkInvoicePaidModal
          isOpen={isMarkPaidOpen}
          onClose={() => setIsMarkPaidOpen(false)}
          invoice={data.invoice}
          onSuccess={() => { mutate(); setIsMarkPaidOpen(false); }}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Supprimer le devis"
        content="Êtes-vous sûr de vouloir supprimer ce devis ?"
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <ConfirmModal
        isOpen={isConfirmInvoiceOpen}
        title="Générer la facture"
        content="Cette action est irréversible. La facture sera créée définitivement et rattachée à la saison active."
        onClose={() => setIsConfirmInvoiceOpen(false)}
        onConfirm={handleIssueInvoice}
      />
      <ConfirmModal
        isOpen={isConfirmCancelInvoiceOpen}
        title="Annuler la facture"
        content="La facture sera marquée comme annulée et le devis repassera en statut « Accepté », ce qui permettra d'en réémettre une nouvelle."
        onClose={() => setIsConfirmCancelInvoiceOpen(false)}
        onConfirm={handleCancelInvoice}
      />
    </div>
  );
}