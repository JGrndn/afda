'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { MemberForm } from '@/components/member/MemberForm';
import { useMember, useMemberActions } from '@/hooks/member.hook';
import { useRegistrationActions } from '@/hooks/registration.hook';
import { useSeasons } from '@/hooks/season.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge } from '@/components/ui';
import { UpdateMemberInput } from '@/lib/schemas/member.input';
import { RegistrationWithWorkshopDetailsDTO } from '@/lib/dto/registration.dto';
import { MembershipWithSeasonDTO } from '@/lib/dto/membership.dto';
import { SEASON_STATUS } from '@/lib/domain/season.enum';
import { RegistrationSlideOver } from '@/components/member/RegistrationSlideOver';

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const memberId = parseInt(resolvedParams.id);

  const { member, isLoading: memberLoading, mutate } = useMember(memberId);
  const { update, remove, isLoading: mutationLoading, error } = useMemberActions();
  
  // Récupérer la saison active
  const { data: seasons } = useSeasons({ status: SEASON_STATUS.ACTIVE });
  const activeSeason = seasons?.[0];

  const { remove: removeRegistration } = useRegistrationActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRegistration, setIsAddingRegistration] = useState(false);
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<number | null>(null);

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

  const handleAddRegistrationSuccess = async () => {
    mutate();
  };

  const handleDeleteRegistration = async (registrationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
      return;
    }

    setDeletingRegistrationId(registrationId);
    try {
      await removeRegistration(registrationId);
      mutate();
    } catch (error) {
      console.error('Failed to delete registration:', error);
    } finally {
      setDeletingRegistrationId(null);
    }
  };

  const handleCreateMembership = () => {
    router.push(`/memberships/new?memberId=${memberId}&seasonId=${activeSeason?.id}`);
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
  
  // Vérifier si le membre a une membership pour la saison active
  const activeMembership = member.memberships?.find(
    (m) => m.seasonId === activeSeason?.id
  );
  const registrationColumns: Column<RegistrationWithWorkshopDetailsDTO>[] = [
    {
      type: 'computed',
      label: 'Atelier',
      render: (reg) => `${reg.workshop.name}`,
    },
    {
      type: 'field',
      key: 'quantity',
      label: 'Quantité',
    },
    {
      type: 'field',
      key: 'totalPrice',
      label: 'Prix',
      render: (reg) => `${reg.totalPrice.toFixed(2)} €`,
    },
    {
      type: 'field',
      key: 'discountPercent',
      label: 'Réduction',
      render: (reg) => `${reg.discountPercent}%`,
    },
    {
      type: 'action',
      label: 'Actions',
      render: (reg) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteRegistration(reg.id)}
            disabled={deletingRegistrationId === reg.id}
          >
            {deletingRegistrationId === reg.id ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      ),
    },
  ];

  const membershipColumns: Column<MembershipWithSeasonDTO>[] = [
    {
      type: 'computed',
      label: 'Saison',
      render: (m) => `${m.season.startYear} / ${m.season.endYear}`,
    },
    {
      type: 'field',
      key: 'amount',
      label: 'Montant',
      render: (m) => `${m.amount.toFixed(2)} €`,
    },
    {
      type: 'field',
      key: 'status',
      label: 'Adhésion',
      render: (m) => <StatusBadge type="membership" status={m.status} />,
    },
    {
      type: 'field',
      key: 'membershipDate',
      label: 'Date',
      render: (m) => new Date(m.membershipDate).toLocaleDateString('fr-FR'),
    },
  ];

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
                  {member.family? (
                    <Link
                      href={`/families/${member.familyId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {member.family.name}
                    </Link>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      member.isMinor
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
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
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.guardianFirstName || '-'}
                  </dd>
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

          {/* Ateliers pour la saison active */}
          {activeSeason && (
            <Card
              title={`Ateliers - Saison ${activeSeason.startYear}-${activeSeason.endYear}`}
              actions={
                <>
                  {!activeMembership && (
                    <Button size="sm" onClick={handleCreateMembership} variant="secondary">
                      <Plus className="w-4 h-4 mr-1" />
                      Adhérer à la saison
                    </Button>
                  )}
                  {activeMembership && !isAddingRegistration && (
                    <Button size="sm" onClick={() => setIsAddingRegistration(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Inscrire à un atelier
                    </Button>
                  )}
                </>
              }
            >
              {!activeMembership ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Le membre n'a pas encore adhéré à la saison en cours.</p>
                  <p className="text-sm mt-2">
                    Créez d'abord une adhésion pour pouvoir créer des inscriptions aux ateliers.
                  </p>
                </div>
              ) : (
                <DataTable<RegistrationWithWorkshopDetailsDTO>
                  data={member.registrations}
                  columns={registrationColumns}
                  emptyMessage="Aucune inscription"
                />
              )}
              {isAddingRegistration && (
                <RegistrationSlideOver
                  memberId={memberId}
                  seasonId={activeSeason.id}
                  defaultDiscount={activeMembership && activeMembership.familyOrder !== 1 ? activeSeason.discountPercent : 0}
                  onSuccess={handleAddRegistrationSuccess}
                  onClose={() => setIsAddingRegistration(false)}
                  isOpen={isAddingRegistration}
                />
              )}
            </Card>
          )}

          {/* Historique des adhésions */}
          <Card title="Historique des adhésions">
            <DataTable<MembershipWithSeasonDTO>
              data={member.memberships as any}
              columns={membershipColumns}
              onRowClick={(membership) => router.push(`/memberships/${membership.id}`)}
              emptyMessage="Aucune adhésion"
            />
          </Card>
        </div>
      )}
    </div>
  );
}