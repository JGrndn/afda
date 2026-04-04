'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DataTable,
  Button,
  Column,
  StatusBadge,
  FormField,
} from '@/components/ui';
import { MarkInvoicePaidModal } from '@/components/quote/MarkInvoicePaidModal';
import { useQuoteInvoices } from '@/hooks/quoteInvoice.hook';
import { useCancelInvoice } from '@/hooks/quote.hook';
import { useSeasons } from '@/hooks/season.hook';
import { QuoteInvoiceWithDetailsDTO } from '@/lib/dto/quoteInvoice.dto';
import { QuoteInvoiceStatus, QUOTE_INVOICE_STATUS } from '@/lib/domain/enums/quoteInvoice.enum';
import { SEASON_STATUS } from '@/lib/domain/enums/season.enum';
import { getStatusOptionsWithAll } from '@/lib/i18n/statusOptions';
import { QUOTE_INVOICE_STATUS_TRANSLATIONS } from '@/lib/i18n/translations';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { CheckCircle, Ban } from 'lucide-react';
import { QuoteInvoicePdfButton } from '@/components/quote/QuoteInvoicePdfButton';
import { ConfirmModal } from '@/components/ui';

interface QuoteInvoicesPageClientProps {
  userRole: UserRole;
}

export function QuoteInvoicesPageClient({ userRole }: QuoteInvoicesPageClientProps) {
  const router = useRouter();

  const { data: seasons } = useSeasons();
  const activeSeason = useMemo(
    () => seasons?.find((s) => s.status === SEASON_STATUS.ACTIVE),
    [seasons]
  );

  const [statusFilter, setStatusFilter] = useState<QuoteInvoiceStatus | undefined>();
  const [seasonFilter, setSeasonFilter] = useState<number | undefined>();
  const [search, setSearch] = useState('');

  // Initialiser sur la saison active
  useEffect(() => {
    if (activeSeason && seasonFilter === undefined) {
      setSeasonFilter(activeSeason.id);
    }
  }, [activeSeason, seasonFilter]);

  const { data: invoices, isLoading, mutate } = useQuoteInvoices({
    status: statusFilter,
    seasonId: seasonFilter,
    search,
  });

  const { cancel, isLoading: isCancelling } = useCancelInvoice();

  const canUpdate = UserRolePermissions.canEdit(userRole);

  const [selectedInvoice, setSelectedInvoice] = useState<QuoteInvoiceWithDetailsDTO | null>(null);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const handleMarkPaidRequest = (inv: QuoteInvoiceWithDetailsDTO) => {
    setSelectedInvoice(inv);
    setIsMarkPaidOpen(true);
  };

  const handleCancelRequest = (inv: QuoteInvoiceWithDetailsDTO) => {
    setSelectedInvoice(inv);
    setIsConfirmCancelOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedInvoice) return;
    const result = await cancel(selectedInvoice.id);
    if (result) {
      mutate();
      setSelectedInvoice(null);
    }
  };

  const statusOptions = useMemo(
    () => getStatusOptionsWithAll(QUOTE_INVOICE_STATUS_TRANSLATIONS, { includeAll: true }),
    []
  );

  const seasonOptions = useMemo(
    () =>
      seasons?.map((s) => ({
        value: s.id.toString(),
        label: `${s.startYear}-${s.endYear}`,
      })) ?? [],
    [seasons]
  );

  const columns: Column<QuoteInvoiceWithDetailsDTO>[] = useMemo(
    () => [
      {
        type: 'field',
        key: 'invoiceNumber',
        label: 'N° facture',
      },
      {
        type: 'field',
        key: 'clientName',
        label: 'Client',
      },
      {
        type: 'field',
        key: 'quoteTitle',
        label: 'Prestation',
      },
      {
        type: 'field',
        key: 'seasonYear',
        label: 'Saison',
        render: (inv) => inv.seasonYear ?? '—',
      },
      {
        type: 'field',
        key: 'totalAmount',
        label: 'Montant',
        render: (inv) => `${inv.totalAmount.toFixed(2)} €`,
      },
      {
        type: 'field',
        key: 'status',
        label: 'Statut',
        render: (inv) => <StatusBadge type="quoteInvoice" status={inv.status} />,
      },
      {
        type: 'field',
        key: 'issuedAt',
        label: 'Émise le',
        render: (inv) => new Date(inv.issuedAt).toLocaleDateString('fr-FR'),
      },
      {
        type: 'action',
        label: 'Actions',
        render: (inv: QuoteInvoiceWithDetailsDTO) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <QuoteInvoicePdfButton invoice={inv} />

            {/* Actions selon statut — MANAGER/ADMIN uniquement */}
            {canUpdate && inv.status === QUOTE_INVOICE_STATUS.ISSUED && (
              <>
                <Button
                  size="sm"
                  Icon={CheckCircle}
                  onClick={() => handleMarkPaidRequest(inv)}
                >
                  Payée
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  Icon={Ban}
                  onClick={() => handleCancelRequest(inv)}
                  disabled={isCancelling && selectedInvoice?.id === inv.id}
                >
                  Annuler
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [canUpdate, isCancelling, selectedInvoice]
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Factures prestations</h1>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Recherche"
            name="search"
            type="text"
            value={search}
            onChange={setSearch}
            placeholder="N° facture, client, prestation..."
            compact
          />
          <FormField
            label="Statut"
            name="status"
            type="select"
            value={statusFilter || ''}
            onChange={(v) =>
              setStatusFilter(v ? (v as QuoteInvoiceStatus) : undefined)
            }
            options={statusOptions}
            compact
          />
          <FormField
            label="Saison"
            name="seasonId"
            type="select"
            value={seasonFilter?.toString() || ''}
            onChange={(v) => setSeasonFilter(v ? parseInt(v) : undefined)}
            options={[{ value: '', label: 'Toutes' }, ...seasonOptions]}
            compact
          />
        </div>
      </div>

      {/* Totaux rapides */}
      {invoices && invoices.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total facturé</p>
            <p className="text-2xl font-bold text-gray-900">
              {invoices
                .reduce((sum, inv) => sum + inv.totalAmount, 0)
                .toFixed(2)}{' '}
              €
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">Encaissé</p>
            <p className="text-2xl font-bold text-green-900">
              {invoices
                .filter((inv) => inv.status === QUOTE_INVOICE_STATUS.PAID)
                .reduce((sum, inv) => sum + inv.totalAmount, 0)
                .toFixed(2)}{' '}
              €
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">En attente</p>
            <p className="text-2xl font-bold text-yellow-900">
              {invoices
                .filter((inv) => inv.status === QUOTE_INVOICE_STATUS.ISSUED)
                .reduce((sum, inv) => sum + inv.totalAmount, 0)
                .toFixed(2)}{' '}
              €
            </p>
          </div>
        </div>
      )}

      <DataTable<QuoteInvoiceWithDetailsDTO>
        data={invoices as QuoteInvoiceWithDetailsDTO[]}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Aucune facture"
        onRowClick={(inv) => router.push(`/quotes/${inv.quoteId}`)}
      />

      {selectedInvoice && (
        <MarkInvoicePaidModal
          isOpen={isMarkPaidOpen}
          onClose={() => { setIsMarkPaidOpen(false); setSelectedInvoice(null); }}
          invoice={selectedInvoice}
          onSuccess={() => { mutate(); setIsMarkPaidOpen(false); setSelectedInvoice(null); }}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        title="Annuler la facture"
        content={`Annuler la facture ${selectedInvoice?.invoiceNumber} ? Le devis associé repassera en statut « Accepté ».`}
        onClose={() => { setIsConfirmCancelOpen(false); setSelectedInvoice(null); }}
        onConfirm={handleCancel}
      />
    </div>
  );
}