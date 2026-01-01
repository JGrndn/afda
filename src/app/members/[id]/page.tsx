'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MemberForm } from '@/components/member/MemberForm';
import { useMember, useMemberActions } from '@/hooks/member';
import { Button, Card, ErrorMessage } from '@/components/ui';
import { UpdateMemberInput } from '@/lib/schemas/member.input';

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const memberId = parseInt(resolvedParams.id);
  
  const { member, isLoading: memberLoading, mutate } = useMember(memberId, true);
  const { update, remove, isLoading: mutationLoading, error } = useMemberActions();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: UpdateMemberInput) => {
    await update(memberId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      await remove(memberId);
      router.push('/members');
    }
  };

  if (memberLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Membre introuvable</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/members"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            {member.isMinor ? 'Mineur' : 'Majeur'}
          </p>
        </div>
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
        <MemberForm
          initialData={member}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Informations personnelles">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.lastName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Prénom</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.firstName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Famille</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {member.familyName ? (
                    <Link 
                      href={`/families/${member.familyId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {member.familyName}
                    </Link>
                  ) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded ${member.isMinor ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {member.isMinor ? 'Mineur' : 'Majeur'}
                  </span>
                </dd>
              </div>
            </dl>
          </Card>

          {member.isMinor && (
            <Card title="Informations du tuteur légal">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.guardianLastName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Prénom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.guardianFirstName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.guardianPhone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.guardianEmail || '-'}</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}