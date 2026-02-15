'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { SeasonDTO } from '@/lib/dto/season.dto';
import { DataTable, Button, ErrorMessage, Column, StatusBadge, ConfirmModal } from '@/components/ui';
import { SeasonSlideOver } from '@/components/season/SeasonSlideOver';
import { useSeasons, useSeasonActions } from '@/hooks/season.hook';
import { CalendarPlus } from 'lucide-react';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { SEASON_STATUS } from '@/lib/domain/enums/season.enum';

interface SeasonsPageClientProps {
  userRole: UserRole;
}

export function SeasonsPageClient({ 
  userRole 
}: SeasonsPageClientProps) {
  const router = useRouter();
  
  // SWR avec données initiales du serveur
  const { data: seasons, isLoading, mutate } = useSeasons();
  
  const { update, error } = useSeasonActions();
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  
  // Permissions dérivées du rôle
  const canCreate = UserRolePermissions.canCreate(userRole);
  const canEdit = UserRolePermissions.canEdit(userRole);
  
  const handleActivate = async (seasonId: number) => {
    setActivatingId(seasonId);
    try {
      // L'API gère automatiquement la désactivation de l'ancienne saison active
      await update(seasonId, { status: SEASON_STATUS.ACTIVE });
      await mutate();
    } catch (error: any) {
      console.error('Failed to activate season:', error);
    } finally {
      setActivatingId(null);
    }
  };

  const handleCreateSuccess = async () => {
    await mutate();
  };
  
  // ✅ Colonnes définies avec useMemo pour éviter les re-renders
  const columns: Column<SeasonDTO>[] = useMemo(() => [
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
    ...(canEdit ? [{
      type: 'action' as const,
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
    }] : []),
  ], [canEdit, activatingId]); // ✅ Dépendances pour useMemo
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Saisons</h1>
        
        {canCreate && (
          <Button onClick={() => setIsSlideOverOpen(true)} Icon={CalendarPlus}>
            Nouvelle saison
          </Button>
        )}
      </div>
      
      {error && <ErrorMessage error={error} />}
      
      <DataTable 
        data={seasons}
        columns={columns}
        onRowClick={(season) => router.push(`/seasons/${season.id}`)}
        isLoading={false}
        emptyMessage="Aucune saison"
      />
      
      <SeasonSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}