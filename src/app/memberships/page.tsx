'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMemberships, useMembershipActions } from '@/hooks/membership.hook';
import { useSeasons } from '@/hooks/season.hook';
import {
  DataTable,
  Button,
  ErrorMessage,
  Column,
  StatusBadge,
  FormField,
} from '@/components/ui';
import { MembershipSummaryDTO } from '@/lib/dto/membership.dto';
import { MEMBERSHIP_STATUS, MembershipStatus } from '@/lib/domain/membership.status';

export default function MembershipsPage() {
  const router = useRouter();
  const { data: seasons } = useSeasons();
  const [seasonFilter, setSeasonFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | undefined>(undefined);

  const {
    data: memberships,
    isLoading,
    mutate,
  } = useMemberships({
    includeSummary: true,
    seasonId: seasonFilter,
    status: statusFilter,
  });

  const { remove, error } = useMembershipActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (membershipId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adhésion ?')) {
      return;
    }

    setDeletingId(membershipId);
    try {
      await remove(membershipId);
      await mutate();
    } catch (error) {
      console.error('Failed to delete membership:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<MembershipSummaryDTO>[] = [
    {
      type: 'field',
      key: 'memberName',
      label: 'Membre',
    },
    {
      type: 'field',
      key: 'familyName',
      label: 'Famille',
      render: (membership) => membership.familyName || '-',
    },
    {
      type: 'field',
      key: 'seasonYear',
      label: 'Saison',
    },
    {
      type: 'field',
      key: 'familyOrder',
      label: 'Ordre',
      render: (membership) => (
        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
          {membership.familyOrder}
        </span>
      ),
    },
    {
      type: 'field',
      key: 'membershipAmount',
      label: 'Adhésion',
      render: (membership) => `${membership.membershipAmount.toFixed(2)} €`,
    },
    {
      type: 'field',
      key: 'workshopsAmount',
      label: 'Ateliers',
      render: (membership) => `${membership.workshopsAmount.toFixed(2)} €`,
    },
    {
      type: 'field',
      key: 'totalAmount',
      label: 'Total',
      render: (membership) => (
        <span className="font-semibold">{membership.totalAmount.toFixed(2)} €</span>
      ),
    },
    {
      type: 'field',
      key: 'status',
      label: 'Statut',
      render: (membership) => <StatusBadge type="membership" status={membership.status} />,
    },
    {
      type: 'action',
      label: 'Actions',
      render: (membership) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" onClick={() => router.push(`/memberships/${membership.membershipId}`)}>
            Voir
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(membership.membershipId)}
            disabled={deletingId === membership.membershipId}
          >
            {deletingId === membership.membershipId ? 'Suppression...' : 'Supprimer'}
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
        <h1 className="text-3xl font-bold">Adhésions</h1>
        <Button onClick={() => router.push('/memberships/new')}>Nouvelle Adhésion</Button>
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
            onChange={(v) => setStatusFilter(v ? (v as MembershipStatus) : undefined)}
            options={[
              { value: '', label: 'Tous' },
              { value: MEMBERSHIP_STATUS.PENDING, label: 'En attente' },
              { value: MEMBERSHIP_STATUS.PAID, label: 'Payé' },
              { value: MEMBERSHIP_STATUS.CANCELLED, label: 'Annulé' },
            ]}
            compact
          />
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      <DataTable<MembershipSummaryDTO>
        data={memberships as MembershipSummaryDTO[]}
        columns={columns}
        onRowClick={(membership) => router.push(`/memberships/${membership.membershipId}`)}
        isLoading={isLoading}
        emptyMessage="Aucune adhésion"
      />
    </div>
  );
}