'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSeasons, useSeasonActions } from '@/hooks/seasons';
import { DataTable, Button, StatusBadge, ErrorMessage } from '@/components/ui';
import { SeasonDTO } from '@/lib/dto/season.type';
import { SEASON_STATUS } from '@/lib/domain/season.status';
import { UpdateSeasonInput } from '@/lib/schemas/season.input';

export default function SeasonsPage() {
  const router = useRouter();
  const { data:seasons, isLoading, mutate } = useSeasons();
  const { update, isLoading: isUpdating } = useSeasonActions();
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleActivate = async (seasonId: number) => {
    setActivatingId(seasonId);
    setError(null);
    try {
      // L'API gère automatiquement la désactivation de l'ancienne saison active
      await update(seasonId, {status: SEASON_STATUS.ACTIVE});
      await mutate();
    } catch (error:any) {
      setError(error);
    } finally {
      setActivatingId(null);
    }
  };

  const handleRowSave = async(seasonId:number, input:UpdateSeasonInput) => {
    setError(null);
    try{
      console.log(input);
      await update(seasonId, input);
      await mutate();
    } catch(error:any){
      setError(error);
      throw error;
    }
  };

  const columns = [
    {
      key: 'label',
      label: 'Saison',
      render: (season: SeasonDTO) => `${season.startYear}-${season.endYear}`,
    },
    {
      key: 'membershipAmount',
      label: 'Adhésion',
      render: (season: SeasonDTO) => `${season.membershipAmount} €`,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (season: SeasonDTO) => (
        <StatusBadge status={season.status} type='season' />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (season: SeasonDTO) => (
        season.status === SEASON_STATUS.INACTIVE && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleActivate(season.id);
            }}
            disabled={activatingId === season.id}
          >
            {activatingId === season.id ? 'Activation...' : 'Activer'}
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Saisons</h1>
        <Button onClick={() => router.push('/seasons/new')}>
          Nouvelle Saison
        </Button>
      </div>
      {error && <ErrorMessage error={error}/>}
      <DataTable
        data={seasons}
        columns={columns}
        isEditable={true}
        onRowSave={handleRowSave}
        onRowClick={(season) => router.push(`/seasons/${season.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucune donnée"
      />
    </div>
  );
}