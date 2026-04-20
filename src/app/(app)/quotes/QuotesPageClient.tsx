'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteWithClientDTO } from '@/lib/dto/quote.dto';
import { QuoteStatus } from '@/lib/domain/enums/quote.enum';
import {
  DataTable,
  Button,
  ErrorMessage,
  Column,
  StatusBadge,
  FormField,
  ConfirmModal,
} from '@/components/ui';
import { QuoteSlideOver } from '@/components/quote/QuoteSlideOver';
import { InvoiceStatusCell } from '@/components/quote/InvoiceStatusCell';
import { useQuotes, useQuoteActions } from '@/hooks/quote.hook';
import { getStatusOptionsWithAll } from '@/lib/i18n/statusOptions';
import { QUOTE_STATUS_TRANSLATIONS } from '@/lib/i18n/translations';
import { FilePlus, Trash2 } from 'lucide-react';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface QuotesPageClientProps {
  userRole: UserRole;
}

export function QuotesPageClient({ userRole }: QuotesPageClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | undefined>();

  const { data: quotes, isLoading, mutate } = useQuotes({ search, status: statusFilter });
  const { remove, error } = useQuoteActions();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const canCreate = UserRolePermissions.canCreate(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const handleDeleteRequest = (id: number) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await remove(deletingId);
      await mutate();
    } finally {
      setDeletingId(null);
    }
  };

  const statusOptions = useMemo(
    () => getStatusOptionsWithAll(QUOTE_STATUS_TRANSLATIONS, { includeAll: true }),
    []
  );

  const columns: Column<QuoteWithClientDTO>[] = useMemo(
    () => [
      {
        type: 'field',
        key: 'quoteNumber',
        label: 'N°',
        render: (q) => q.quoteNumber ?? '—',
      },
      { type: 'field', key: 'clientName', label: 'Client' },
      { type: 'field', key: 'title', label: 'Titre' },
      {
        type: 'field',
        key: 'totalAmount',
        label: 'Montant',
        render: (q) => `${q.totalAmount.toFixed(2)} €`,
      },
      {
        type: 'field',
        key: 'status',
        label: 'Statut devis',
        render: (q) => <StatusBadge type="quote" status={q.status} />,
      },
      {
        type: 'computed',
        label: 'Facture',
        render: (q) => (
          <InvoiceStatusCell
            invoiceStatus={q.invoiceStatus}
            invoicePaidAt={q.invoicePaidAt}
          />
        ),
      },
      {
        type: 'field',
        key: 'issuedAt',
        label: 'Émis le',
        render: (q) =>
          q.issuedAt ? new Date(q.issuedAt).toLocaleDateString('fr-FR') : '—',
      },
      {
        type: 'field',
        key: 'validUntil',
        label: 'Valable jusqu\'au',
        render: (q) =>
          q.validUntil ? new Date(q.validUntil).toLocaleDateString('fr-FR') : '—',
      },
      ...(canDelete
        ? [
            {
              type: 'action' as const,
              label: 'Actions',
              render: (q: QuoteWithClientDTO) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="softdanger"
                    Icon={Trash2}
                    onClick={() => handleDeleteRequest(q.id)}
                    disabled={deletingId === q.id}
                  />
                </div>
              ),
            },
          ]
        : []),
    ],
    [canDelete, deletingId]
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Devis</h1>
        {canCreate && (
          <Button onClick={() => setIsSlideOverOpen(true)} Icon={FilePlus}>
            Nouveau devis
          </Button>
        )}
      </div>

      {error && <ErrorMessage error={error} />}

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="search"
            label="Recherche"
            type="text"
            value={search}
            onChange={setSearch}
            placeholder="Titre, client, n° devis..."
            compact
          />
          <FormField
            name="status"
            label="Statut"
            type="select"
            value={statusFilter || ''}
            onChange={(v) => setStatusFilter(v ? (v as QuoteStatus) : undefined)}
            options={statusOptions}
            compact
          />
        </div>
      </div>

      <DataTable<QuoteWithClientDTO>
        data={quotes as QuoteWithClientDTO[]}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Aucun devis"
        onRowClick={(q) => router.push(`/quotes/${q.id}`)}
      />

      <QuoteSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={() => mutate()}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Supprimer le devis"
        content="Êtes-vous sûr de vouloir supprimer ce devis ?"
        onClose={() => { setIsConfirmOpen(false); setDeletingId(null); }}
        onConfirm={handleDelete}
      />
    </div>
  );
}