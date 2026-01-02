'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMembers, useMemberActions } from '@/hooks/member';
import { DataTable, Button, ErrorMessage, Column, FormField } from '@/components/ui';
import { MemberWithFamilyDTO } from '@/lib/dto/member.dto';
import { Trash2 } from 'lucide-react';

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  const { data: members, isLoading, mutate } = useMembers({ 
    search,
  });
  
  const { remove, error } = useMemberActions();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (memberId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }
    
    setDeletingId(memberId);
    try {
      await remove(memberId);
      await mutate();
    } catch (error) {
      console.error('Failed to delete member:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<MemberWithFamilyDTO>[] = [
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
    {
      type: 'action',
      label: 'Actions',
      render: (member) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="danger"
            onClick={() => handleDelete(member.id)}
            disabled={deletingId === member.id}
            Icon={Trash2}
          >
            {deletingId === member.id ? (
              'Suppression...'
            ) : ''}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Membres</h1>
        <Button onClick={() => router.push('/members/new')}>
          Nouveau Membre
        </Button>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Recherche"
            name="search"
            type="text"
            value={search}
            onChange={setSearch}
            placeholder="Nom, prénom, email..."
            compact
          />
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      <DataTable<MemberWithFamilyDTO>
        data={members as MemberWithFamilyDTO[]}
        columns={columns}
        onRowClick={(member) => router.push(`/members/${member.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucun membre"
      />
    </div>
  );
}