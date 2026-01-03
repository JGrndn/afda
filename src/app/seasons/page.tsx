'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSeasons, useSeasonActions } from '@/hooks/season.hook';
import { DataTable, Button, StatusBadge, ErrorMessage, Column } from '@/components/ui';
import { SeasonDTO } from '@/lib/dto/season.dto';
import { SEASON_STATUS } from '@/lib/domain/season.status';
import { UpdateSeasonInput } from '@/lib/schemas/season.input';
import { CalendarPlus, CalendarPlus2 } from 'lucide-react';

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
      await update(seasonId, input);
      await mutate();
    } catch(error:any){
      setError(error);
      throw error;
    }
  };

  const columns : Column<SeasonDTO>[]= [
    {
      type: 'computed',
      label: 'Saison',
      render: (season: SeasonDTO) => `${season.startYear}-${season.endYear}`,
    },
    {
      type: 'field',
      key: 'membershipAmount',
      label: 'Adhésion (€)',
    },
    {
      type: 'field',
      key: 'status',
      label: 'Statut',
      render: (season: SeasonDTO) => (
        <StatusBadge status={season.status} type='season' />
      ),
    },
    {
      type: 'action',
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
        <Button onClick={() => router.push('/seasons/new')} Icon={CalendarPlus}/>
      </div>
      {error && <ErrorMessage error={error}/>}
      <DataTable<SeasonDTO>
        data={seasons}
        columns={columns}
        onRowClick={(season) => router.push(`/seasons/${season.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucune donnée"
      />
    </div>
  );
}