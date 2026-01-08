'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilies, useFamilyActions } from '@/hooks/family.hook';
import { DataTable, Button, ErrorMessage, Column } from '@/components/ui';
import { FamilyDTO } from '@/lib/dto/family.dto';
import { Trash2, UserRoundPlus } from 'lucide-react';
import { FamilySlideOver } from '@/components/family/FamilySlideOver';

export default function FamiliesPage() {
  const router = useRouter();
  const { data: families, isLoading, mutate } = useFamilies();
  const { remove, isLoading: isDeleting, error } = useFamilyActions();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

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

  const handleCreateSucess = () => {
    mutate();
  };


  const columns: Column<FamilyDTO>[] = [
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
      type: 'action',
      label: 'Actions',
      render: (family) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="danger"
            onClick={() => handleDelete(family.id)}
            disabled={deletingId === family.id}
            Icon={Trash2}
          >
            {deletingId === family.id ? 'Suppression...' : ''}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Familles</h1>
        <Button onClick={() => setIsSlideOverOpen(true)} Icon={UserRoundPlus}/>
      </div>

      {error && <ErrorMessage error={error} />}

      <DataTable<FamilyDTO>
        data={families}
        columns={columns}
        onRowClick={(family) => router.push(`/families/${family.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucune famille"
      />
      <FamilySlideOver 
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)} 
        onSuccess={handleCreateSucess}        
      />
    </div>
  );
}