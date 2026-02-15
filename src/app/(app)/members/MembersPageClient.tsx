'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { MemberWithFamilyNameDTO } from '@/lib/dto/member.dto';
import { DataTable, Button, ErrorMessage, Column, FormField, ConfirmModal } from '@/components/ui';
import { MemberSlideOver } from '@/components/member/MemberSlideOver';
import { useMembers, useMemberActions } from '@/hooks/member.hook';
import { Trash2, UserRoundPlus } from 'lucide-react';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface MembersPageClientProps {
  userRole: UserRole;
}

export function MembersPageClient({ 
  userRole 
}: MembersPageClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  // SWR avec données initiales du serveur
  const {data:members, isLoading, mutate } = useMembers({search});
  
  const { remove, error } = useMemberActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isConfirmModalDeleteOpen, setIsConfirmModalDeleteOpen] = useState(false);
  
  // Permissions dérivées du rôle
  const canCreate = UserRolePermissions.canCreate(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);
  
  const handleDeleteRequest = (memberId: number) => {
    setIsConfirmModalDeleteOpen(true);
    setDeletingId(memberId);
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
      console.error('Failed to delete member:', error);
    } finally {
      setDeletingId(null);
    }
  };
  
  // ✅ Colonnes définies avec useMemo pour éviter les re-renders
  const columns: Column<MemberWithFamilyNameDTO>[] = useMemo(() => [
    {
      type: 'computed',
      label: 'Nom',
      render: (member) => `${member.firstName} ${member.lastName}`,
    },
    {
      type: 'field',
      key: 'familyName',
      label: 'Famille',
      render: (member) => member.familyName || '-',
    },
    {
      type: 'field',
      key: 'email',
      label: 'Email',
      render: (member) => member.email || '-',
    },
    {
      type: 'field',
      key: 'phone',
      label: 'Téléphone',
      render: (member) => member.phone || '-',
    },
    {
      type: 'field',
      key: 'isMinor',
      label: 'Statut',
      render: (member) => (
        <span className={`px-2 py-1 text-xs rounded ${member.isMinor ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {member.isMinor ? 'Mineur' : 'Majeur'}
        </span>
      ),
    },
    ...(canDelete ? [{
      type: 'action' as const,
      label: 'Actions',
      render: (member: MemberWithFamilyNameDTO) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="danger"
            onClick={() => handleDeleteRequest(member.id)}
            disabled={deletingId === member.id}
            Icon={Trash2}
          >
            {deletingId === member.id ? 'Suppression...' : ''}
          </Button>
        </div>
      ),
    }] : []),
  ], [canDelete, deletingId]); // ✅ Dépendances pour useMemo
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Membres</h1>
        
        {canCreate && (
          <Button onClick={() => setIsSlideOverOpen(true)} Icon={UserRoundPlus}>
            Nouveau membre
          </Button>
        )}
      </div>
      
      {error && <ErrorMessage error={error} />}
      
      <div className="mb-4">
        <FormField
          label="Rechercher"
          name="search"
          type="text"
          value={search}
          onChange={setSearch}
          placeholder="Nom, email..."
          compact
        />
      </div>
      
      <DataTable 
        data={members}
        columns={columns}
        onRowClick={(member) => router.push(`/members/${member.id}`)}
        isLoading={false}
        emptyMessage="Aucun membre"
      />
      
      <MemberSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalDeleteOpen}
        title="Supprimer le membre"
        content="Êtes-vous sûr de vouloir supprimer ce membre ?"
        onClose={() => {
          setIsConfirmModalDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}