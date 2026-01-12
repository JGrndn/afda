'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilies, useFamilyActions } from '@/hooks/family.hook';
import { DataTable, Button, ErrorMessage, Column, ConfirmModal } from '@/components/ui';
import { FamilyDTO } from '@/lib/dto/family.dto';
import { Trash2, UserRoundPlus } from 'lucide-react';
import { FamilySlideOver } from '@/components/family/FamilySlideOver';

export default function FamiliesPage() {
  const router = useRouter();
  const { data: families, isLoading, mutate } = useFamilies();
  const { remove, isLoading: isDeleting, error } = useFamilyActions();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isConfirmModalDeleteOpen, setIsConfirmModalDeleteOpen] = useState(false);

  const handleDeleteRequest = async (familyId: number) => {
    setIsConfirmModalDeleteOpen(true);
    setDeletingId(familyId);
  }

  const handleDelete = async () => {
    if(!deletingId) return;
    try {
      await remove(deletingId);
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
            onClick={() => handleDeleteRequest(family.id)}
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
      <ConfirmModal
        isOpen={isConfirmModalDeleteOpen}
        title={"Supprimer la famille"}
        content={'Etes-vous sûr de vouloir supprimer cette famille ?'}
        onClose={() => {
          setIsConfirmModalDeleteOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}