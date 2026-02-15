'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { WorkshopDTO } from '@/lib/dto/workshop.dto';
import { WorkshopStatus } from '@/lib/domain/enums/workshop.enum';
import { DataTable, Button, ErrorMessage, Column, StatusBadge, FormField, ConfirmModal } from '@/components/ui';
import { WorkshopSlideOver } from '@/components/workshop/WorkshopSlideOver';
import { useWorkshops, useWorkshopActions } from '@/hooks/workshop.hook';
import { getStatusOptionsWithAll } from '@/lib/i18n/statusOptions';
import { WORKSHOP_STATUS_TRANSLATIONS } from '@/lib/i18n/translations';
import { ListPlus, Trash2 } from 'lucide-react';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface WorkshopsPageClientProps {
  userRole: UserRole;
}

export function WorkshopsPageClient({
  userRole 
}: WorkshopsPageClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkshopStatus | undefined>(undefined);
  
  // ✅ Utilisation du hook useWorkshops qui gère déjà tout
  const { data: workshops, isLoading, mutate } = useWorkshops({
    search,
    status: statusFilter,
  });
  
  const { remove, error } = useWorkshopActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isConfirmModalDeleteOpen, setIsConfirmModalDeleteOpen] = useState(false);
  
  // Permissions dérivées du rôle
  const canCreate = UserRolePermissions.canCreate(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const handleDeleteRequest = (workshopId: number) => {
    setIsConfirmModalDeleteOpen(true);
    setDeletingId(workshopId);
  };

  const handleCreateSuccess = async () => {
    await mutate();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await remove(deletingId);
      await mutate();
    } catch (error) {
      console.error('Failed to delete workshop:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Colonnes définies avec useMemo pour éviter les re-renders
  const columns: Column<WorkshopDTO>[] = useMemo(() => [
    {
      type: 'field',
      key: 'name',
      label: 'Nom',
    },
    {
      type: 'field',
      key: 'description',
      label: 'Description',
      render: (workshop) => workshop.description || '-',
    },
    {
      type: 'field',
      key: 'status',
      label: 'Statut',
      render: (workshop) => <StatusBadge status={workshop.status} type="workshop" />,
    },
    {
      type: 'field',
      key: 'allowMultiple',
      label: 'Multiple',
      render: (workshop) => (
        <span className={`px-2 py-1 text-xs rounded ${workshop.allowMultiple ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {workshop.allowMultiple ? `Oui (max ${workshop.maxPerMember})` : 'Non'}
        </span>
      ),
    },
    ...(canDelete ? [{
      type: 'action' as const,
      label: 'Actions',
      render: (workshop: WorkshopDTO) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            Icon={Trash2}
            variant="danger"
            onClick={() => handleDeleteRequest(workshop.id)}
            disabled={deletingId === workshop.id}
          >
            {deletingId === workshop.id ? 'Suppression...' : ''}
          </Button>
        </div>
      ),
    }] : []),
  ], [canDelete, deletingId]);

  const workshopStatusFilter = useMemo(
    () => getStatusOptionsWithAll(WORKSHOP_STATUS_TRANSLATIONS, { includeAll: true }),
    []
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ateliers</h1>
        
        {canCreate && (
          <Button onClick={() => setIsSlideOverOpen(true)} Icon={ListPlus}>
            Nouvel atelier
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Recherche"
            name="search"
            type="text"
            value={search}
            onChange={setSearch}
            placeholder="Nom, description..."
            compact
          />
          <FormField
            label="Statut"
            name="status"
            type="select"
            placeholder="Filtrer..."
            value={statusFilter || ''}
            onChange={(v) => setStatusFilter(v ? (v as WorkshopStatus) : undefined)}
            options={workshopStatusFilter}
            compact
          />
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      <DataTable<WorkshopDTO>
        data={workshops}
        columns={columns}
        onRowClick={(workshop) => router.push(`/workshops/${workshop.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucun atelier"
      />
      
      <WorkshopSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalDeleteOpen}
        title="Supprimer l'atelier"
        content="Êtes-vous sûr de vouloir supprimer cet atelier ?"
        onClose={() => {
          setIsConfirmModalDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}