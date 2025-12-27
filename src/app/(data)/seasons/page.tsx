'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSeasons } from '@/hooks/seasons';
import { DataTable, Button, StatusBadge } from '@/components/ui';
import { SEASON_STATUS } from '@/lib/schemas/season';

export default function SeasonsPage() {
  const router = useRouter();
  const { data:seasons, isLoading, mutate } = useSeasons();
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const handleActivate = async (seasonId: number) => {
    setActivatingId(seasonId);
    try {
      // L'API gère automatiquement la désactivation de l'ancienne saison active
      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: SEASON_STATUS.ACTIVE }),
      });

      if (response.ok) {
        await mutate(); // Rafraîchir la liste
      }
    } catch (error) {
      console.error('Error activating season:', error);
    } finally {
      setActivatingId(null);
    }
  };

  const columns = [
    {
      key: 'label',
      label: 'Season',
      render: (season: any) => `${season.startYear}-${season.endYear}`,
    },
    {
      key: 'membershipAmount',
      label: 'Membership',
      render: (season: any) => `€${season.membershipAmount}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (season: any) => (
        <StatusBadge status={season.status} type='season' />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (season: any) => (
        season.status === SEASON_STATUS.INACTIVE && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleActivate(season.id);
            }}
            disabled={activatingId === season.id}
          >
            {activatingId === season.id ? 'Activating...' : 'Activate'}
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Seasons</h1>
        <Button onClick={() => router.push('/seasons/new')}>
          Add Season
        </Button>
      </div>

      <DataTable
        data={seasons}
        columns={columns}
        onRowClick={(season) => router.push(`/seasons/${season.id}`)}
        isLoading={isLoading}
        emptyMessage="No seasons found"
      />
    </div>
  );
}