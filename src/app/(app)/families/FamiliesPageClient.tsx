'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyDTO } from '@/lib/dto/family.dto';
import { DataTable, Button, ErrorMessage, Column, ConfirmModal } from '@/components/ui';
import { FamilySlideOver } from '@/components/family/FamilySlideOver';
import { useFamilies, useFamilyActions } from '@/hooks/family.hook';
import { Trash2, UserRoundPlus } from 'lucide-react';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface FamiliesPageClientProps {
  userRole: UserRole;
}

export function FamiliesPageClient({ 
  userRole 
}: FamiliesPageClientProps) {
  const router = useRouter();
  
  // ✅ Utilisation du hook useFamilies qui gère déjà tout (SWR + fetcher + mutate)
  const { data: families, isLoading, mutate } = useFamilies();
  
  const { remove, error } = useFamilyActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isConfirmModalDeleteOpen, setIsConfirmModalDeleteOpen] = useState(false);
  
  // Permissions dérivées du rôle
  const canCreate = UserRolePermissions.canCreate(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);
  
  const handleDeleteRequest = (familyId: number) => {
    setIsConfirmModalDeleteOpen(true);
    setDeletingId(familyId);
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
      console.error('Failed to delete family:', error);
    } finally {
      setDeletingId(null);
    }
  };
  
  // ✅ Colonnes définies avec useMemo pour éviter les re-renders
  const columns: Column<FamilyDTO>[] = useMemo(() => [
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
    ...(canDelete ? [{
      type: 'action' as const,
      label: 'Actions',
      render: (family: FamilyDTO) => (
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
    }] : []),
  ], [canDelete, deletingId]); // ✅ Dépendances pour useMemo
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Familles</h1>
        
        {canCreate && (
          <Button onClick={() => setIsSlideOverOpen(true)} Icon={UserRoundPlus}>
            Nouvelle famille
          </Button>
        )}
      </div>
      
      {error && <ErrorMessage error={error} />}
      
      <DataTable 
        data={families}
        columns={columns}
        onRowClick={(family) => router.push(`/families/${family.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucune famille"
      />
      
      <FamilySlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalDeleteOpen}
        title="Supprimer la famille"
        content="Êtes-vous sûr de vouloir supprimer cette famille ?"
        onClose={() => {
          setIsConfirmModalDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}