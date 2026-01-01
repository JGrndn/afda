'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilies, useFamilyActions } from '@/hooks/family';
import { DataTable, Button, ErrorMessage, Column } from '@/components/ui';
import { FamilyWithMembersDTO } from '@/lib/dto/family.dto';

export default function FamiliesPage() {
  const router = useRouter();
  const { data: families, isLoading, mutate } = useFamilies({ includeMemberCount: true });
  const { remove, isLoading: isDeleting, error } = useFamilyActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (familyId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette famille ? Tous les membres associés seront également supprimés.')) {
      return;
    }
    
    setDeletingId(familyId);
    try {
      await remove(familyId);
      await mutate();
    } catch (error) {
      console.error('Failed to delete family:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<FamilyWithMembersDTO>[] = [
    {
      type: 'field',
      key: 'name',
      label: 'Nom',
    },
    {
      type: 'field',
      key: 'email',
      label: 'Email',
      render: (family) => family.email || '-',
    },
    {
      type: 'field',
      key: 'phone',
      label: 'Téléphone',
      render: (family) => family.phone || '-',
    },
    {
      type: 'computed',
      label: 'Membres',
      render: (family) => family.memberCount,
    },
    {
      type: 'action',
      label: 'Actions',
      render: (family) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            onClick={() => router.push(`/families/${family.id}`)}
          >
            Voir
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(family.id)}
            disabled={deletingId === family.id}
          >
            {deletingId === family.id ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Familles</h1>
        <Button onClick={() => router.push('/families/new')}>
          Nouvelle Famille
        </Button>
      </div>

      {error && <ErrorMessage error={error} />}

      <DataTable<FamilyWithMembersDTO>
        data={families as FamilyWithMembersDTO[]}
        columns={columns}
        onRowClick={(family) => router.push(`/families/${family.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucune famille"
      />
    </div>
  );
}