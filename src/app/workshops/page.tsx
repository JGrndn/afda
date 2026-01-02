'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkshops, useWorkshopActions } from '@/hooks/workshop';
import { DataTable, Button, ErrorMessage, Column, StatusBadge, FormField } from '@/components/ui';
import { WorkshopDTO } from '@/lib/dto/workshop.dto';
import { WORKSHOP_STATUS, WorkshopStatus } from '@/lib/domain/workshop.status';
import { Trash2 } from 'lucide-react';

export default function WorkshopsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkshopStatus | undefined>(undefined);
  
  const { data: workshops, isLoading, mutate } = useWorkshops({
    search,
    status: statusFilter,
  });
  
  const { remove, error } = useWorkshopActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (workshopId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet atelier ? Tous les prix associés seront également supprimés.')) {
      return;
    }

    setDeletingId(workshopId);
    try {
      await remove(workshopId);
      await mutate();
    } catch (error) {
      console.error('Failed to delete workshop:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<WorkshopDTO>[] = [
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
    {
      type: 'action',
      label: 'Actions',
      render: (workshop) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            Icon={Trash2}
            variant="danger"
            onClick={() => handleDelete(workshop.id)}
            disabled={deletingId === workshop.id}
          >
            {deletingId === workshop.id ? 'Suppression...' : ''}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ateliers</h1>
        <Button onClick={() => router.push('/workshops/new')}>Nouvel Atelier</Button>
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
            value={statusFilter || ''}
            onChange={(v) => setStatusFilter(v ? (v as WorkshopStatus) : undefined)}
            options={[
              { value: '', label: 'Tous' },
              { value: WORKSHOP_STATUS.ACTIVE, label: 'Actifs' },
              { value: WORKSHOP_STATUS.INACTIVE, label: 'Inactifs' },
            ]}
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
    </div>
  );
}