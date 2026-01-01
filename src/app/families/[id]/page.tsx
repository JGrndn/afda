'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FamilyForm } from '@/components/family/FamilyForm';
import { useFamily, useFamilyActions } from '@/hooks/family';
import { useMembers } from '@/hooks/member';
import { Button, Card, ErrorMessage, DataTable, Column } from '@/components/ui';
import { UpdateFamilyInput } from '@/lib/schemas/family.input';
import { MemberDTO } from '@/lib/dto/member.dto';

export default function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const familyId = parseInt(resolvedParams.id);
  
  const { family, isLoading: familyLoading, mutate } = useFamily(familyId, true);
  const { data: members, isLoading: membersLoading } = useMembers({ familyId });
  const { update, remove, isLoading: mutationLoading, error } = useFamilyActions();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: UpdateFamilyInput) => {
    await update(familyId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette famille ? Tous les membres associés seront également supprimés.')) {
      await remove(familyId);
      router.push('/families');
    }
  };

  if (familyLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Famille introuvable</p>
        </Card>
      </div>
    );
  }

  const memberColumns: Column<MemberDTO>[] = [
    {
      type: 'computed',
      label: 'Nom',
      render: (member) => `${member.firstName} ${member.lastName}`,
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
      render: (member) => member.isMinor ? 'Mineur' : 'Majeur',
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/families"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{family.name}</h1>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)}>Modifier</Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <FamilyForm
          initialData={family}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Informations">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.phone || '-'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                <dd className="mt-1 text-sm text-gray-900">{family.address || '-'}</dd>
              </div>
            </dl>
          </Card>

          <Card 
            title="Membres"
            actions={
              <Button size="sm" onClick={() => router.push(`/members/new?familyId=${familyId}`)}>
                Ajouter un membre
              </Button>
            }
          >
            <DataTable<MemberDTO>
              data={members}
              columns={memberColumns}
              onRowClick={(member) => router.push(`/members/${member.id}`)}
              isLoading={membersLoading}
              emptyMessage="Aucun membre dans cette famille"
            />
          </Card>
        </div>
      )}
    </div>
  );
}