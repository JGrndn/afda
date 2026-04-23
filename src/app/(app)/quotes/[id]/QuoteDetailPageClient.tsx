'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, FileText } from 'lucide-react';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { QuotePdfModal } from '@/components/quote/QuotePdfModal';
import { QuoteActions } from '@/components/quote/QuoteActions';
import { useQuote, useQuoteActions } from '@/hooks/quote.hook';
import { useClient } from '@/hooks/client.hook';
import { Button, Card, ErrorMessage, StatusBadge, ConfirmModal } from '@/components/ui';
import { QuoteWithDetailsDTO, QuoteItemDTO } from '@/lib/dto/quote.dto';
import { QUOTE_STATUS } from '@/lib/domain/enums/quote.enum';
import { UpdateQuoteInput } from '@/lib/schemas/quote.input';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { AuditLogButton } from '@/components/audit/AuditLogButton';

interface QuoteDetailPageClientProps {
  initialQuote: QuoteWithDetailsDTO;
  userRole: UserRole;
}

export function QuoteDetailPageClient({ initialQuote, userRole }: QuoteDetailPageClientProps) {
  const router = useRouter();
  const { quote, mutate } = useQuote(initialQuote.id);
  const { update, remove, isLoading: mutationLoading, error } = useQuoteActions();
  const data = quote ?? initialQuote;
  const { client } = useClient(initialQuote.clientId);

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pdfModal, setPdfModal] = useState<'quote' | 'invoice' | null>(null);

  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);
  const isEditable = data.status === QUOTE_STATUS.DRAFT;

  const handleDelete = async () => {
    await remove(data.id);
    router.push('/quotes');
  };

  const editDeleteActions = [
    { label: 'Modifier', icon: Pencil, onClick: () => setIsEditing(true), hidden: !canUpdate || isEditing || !isEditable },
    { label: 'Supprimer', icon: Trash2, onClick: () => setIsConfirmDeleteOpen(true), variant: 'danger' as const, hidden: !canDelete || !isEditable },
  ];

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
          <Button size="sm" variant="secondary" Icon={FileText} onClick={() => setPdfModal('quote')}>
            PDF devis
          </Button>
          {data.invoice && (
            <Button size="sm" variant="secondary" Icon={FileText} onClick={() => setPdfModal('invoice')}>
              PDF facture
            </Button>
          )}
          {/* Historique — MANAGER/ADMIN uniquement, desktop uniquement */}
          {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
            <AuditLogButton entityType="quote" entityId={data.id} />
          )}

          {!isEditing && (
            <QuoteActions
              quote={data}
              userRole={userRole}
              onMutate={mutate}
              editDeleteActions={editDeleteActions}
            />
          )}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

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
                <QuoteActions
                  quote={data}
                  userRole={userRole}
                  onMutate={mutate}
                  editDeleteActions={[]}
                />
              </div>
            </Card>
          )}

          <Card title="Lignes du devis">
            <div className="overflow-x-auto">
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

      <ConfirmModal isOpen={isConfirmDeleteOpen} title="Supprimer le devis" content="Êtes-vous sûr de vouloir supprimer ce devis ?" onClose={() => setIsConfirmDeleteOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}