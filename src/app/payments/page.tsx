'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayments, usePaymentActions } from '@/hooks/payment.hook';
import { useSeasons } from '@/hooks/season.hook';
import {
  DataTable,
  Button,
  ErrorMessage,
  Column,
  StatusBadge,
  FormField,
} from '@/components/ui';
import { PaymentWithDetailsDTO } from '@/lib/dto/payment.dto';
import { PAYMENT_STATUS, PaymentStatus } from '@/lib/domain/payment.enum';
import { SEASON_STATUS } from '@/lib/domain/season.enum';

export default function PaymentsPage() {
  const router = useRouter();
  const { data: seasons } = useSeasons();
  
  // Par défaut, afficher la saison active
  const activeSeason = seasons?.find((s) => s.status === SEASON_STATUS.ACTIVE);
  const [seasonFilter, setSeasonFilter] = useState<number | undefined>(activeSeason?.id);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>(undefined);

  const {
    data: payments,
    isLoading,
    mutate,
  } = usePayments({
    includeDetails: true,
    seasonId: seasonFilter,
    status: statusFilter,
  });

  const { remove, error } = usePaymentActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (paymentId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      return;
    }

    setDeletingId(paymentId);
    try {
      await remove(paymentId);
      await mutate();
    } catch (error) {
      console.error('Failed to delete payment:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<PaymentWithDetailsDTO>[] = [
    {
      type: 'field',
      key: 'familyName',
      label: 'Famille',
    },
    {
      type: 'field',
      key: 'seasonYear',
      label: 'Saison',
    },
    {
      type: 'field',
      key: 'amount',
      label: 'Montant',
      render: (payment) => `${payment.amount.toFixed(2)} €`,
    },
    {
      type: 'field',
      key: 'paymentType',
      label: 'Type',
      render: (payment) => {
        const types: Record<string, string> = {
          cash: 'Espèces',
          check: 'Chèque',
          transfer: 'Virement',
          card: 'Carte',
        };
        return types[payment.paymentType] || payment.paymentType;
      },
    },
    {
      type: 'field',
      key: 'paymentDate',
      label: 'Date',
      render: (payment) => new Date(payment.paymentDate).toLocaleDateString('fr-FR'),
    },
    {
      type: 'field',
      key: 'status',
      label: 'Statut',
      render: (payment) => <StatusBadge type="payment" status={payment.status} />,
    },
    {
      type: 'field',
      key: 'reference',
      label: 'Référence',
      render: (payment) => payment.reference || '-',
    },
    {
      type: 'action',
      label: 'Actions',
      render: (payment) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(payment.id)}
            disabled={deletingId === payment.id}
          >
            {deletingId === payment.id ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      ),
    },
  ];

  const seasonOptions =
    seasons?.map((s) => ({
      value: s.id.toString(),
      label: `${s.startYear}-${s.endYear}`,
    })) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Paiements</h1>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Saison"
            name="seasonId"
            type="select"
            value={seasonFilter?.toString() || ''}
            onChange={(v) => setSeasonFilter(v ? parseInt(v) : undefined)}
            options={[{ value: '', label: 'Toutes' }, ...seasonOptions]}
            compact
          />
          <FormField
            label="Statut"
            name="status"
            type="select"
            value={statusFilter || ''}
            onChange={(v) => setStatusFilter(v ? (v as PaymentStatus) : undefined)}
            options={[
              { value: '', label: 'Tous' },
              { value: PAYMENT_STATUS.PENDING, label: 'En attente' },
              { value: PAYMENT_STATUS.COMPLETED, label: 'Encaissé' },
              { value: PAYMENT_STATUS.CANCELLED, label: 'Annulé' },
            ]}
            compact
          />
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      <DataTable<PaymentWithDetailsDTO>
        data={payments as PaymentWithDetailsDTO[]}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Aucun paiement"
      />
    </div>
  );
}