'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { MemberForm } from '@/components/member/MemberForm';
import { useMember, useMemberActions } from '@/hooks/member.hook';
import { useRegistrationActions } from '@/hooks/registration.hook';
import { useSeasons } from '@/hooks/season.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge, ConfirmModal } from '@/components/ui';
import { UpdateMemberInput } from '@/lib/schemas/member.input';
import { RegistrationDTO, RegistrationWithWorkshopDetailsDTO } from '@/lib/dto/registration.dto';
import { MembershipWithSeasonDTO } from '@/lib/dto/membership.dto';
import { MemberWithFullDetailsDTO } from '@/lib/dto/member.dto';
import { RegistrationSlideOver } from '@/components/member/RegistrationSlideOver';
import { ReconcileFamilySeasonButton } from '@/components/membership/ReconcileFamilySeasonButton';
import { MembershipSlideOver } from '@/components/member/MembershipSlideOver';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { SEASON_STATUS } from '@/lib/domain/enums/season.enum';

interface MemberDetailPageClientProps {
  initialMember: MemberWithFullDetailsDTO;
  userRole: UserRole;
}

export function MemberDetailPageClient({ 
  initialMember, 
  userRole 
}: MemberDetailPageClientProps) {
  const router = useRouter();
  const memberId = initialMember.id;
  
  // ✅ Utilisation des hooks existants
  const { member, isLoading: memberLoading, mutate } = useMember(memberId);
  const { data: seasons } = useSeasons({ status: SEASON_STATUS.ACTIVE });
  const activeSeason = seasons?.[0];
  
  const { update, remove, isLoading: mutationLoading, error } = useMemberActions();
  const { remove: removeRegistration } = useRegistrationActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRegistration, setIsAddingRegistration] = useState(false);
  const [isAddingMembership, setIsAddingMembership] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDTO | null>();
  const [isConfirmModalDeleteMemberOpen, setIsConfirmModalDeleteMemberOpen] = useState(false);
  const [isConfirmModalDeleteRegistrationOpen, setIsConfirmModalDeleteRegistrationOpen] = useState(false);
  
  // Permissions dérivées du rôle
  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const handleUpdate = async (data: UpdateMemberInput) => {
    await update(memberId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDeleteRequest = () => {
    setIsConfirmModalDeleteMemberOpen(true);
  };

  const handleDelete = async () => {
    await remove(memberId);
    router.push('/members');
  };

  const handleRefreshSuccess = () => {
    mutate();
  };

  const handleAddRegistrationSuccess = async () => {
    mutate();
  };

  const handleDeleteRegistrationRequest = (registration: RegistrationDTO) => {
    setIsConfirmModalDeleteRegistrationOpen(true);
    setSelectedRegistration(registration);
  };

  const handleDeleteRegistration = async () => {
    if (!selectedRegistration) return;
    try {
      await removeRegistration(selectedRegistration.id);
      mutate();
    } catch (error) {
      console.error('Failed to delete registration:', error);
    } finally {
      setSelectedRegistration(null);
    }
  };

  const handleAddMembershipSuccess = async () => {
    mutate();
  };

  // ✅ Calculer les colonnes AVANT les returns conditionnels
  // (les hooks doivent toujours être appelés dans le même ordre)
  const registrationColumns: Column<RegistrationWithWorkshopDetailsDTO>[] = useMemo(() => [
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
    ...(canDelete ? [{
      type: 'action' as const,
      label: 'Actions',
      render: (reg: RegistrationWithWorkshopDetailsDTO) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteRegistrationRequest(reg)}
            disabled={selectedRegistration?.id === reg.id}
            Icon={Trash2}
          >
            {selectedRegistration?.id === reg.id ? 'Suppression...' : ''}
          </Button>
        </div>
      ),
    }] : []),
  ], [canDelete, selectedRegistration]);

  const membershipColumns: Column<MembershipWithSeasonDTO>[] = useMemo(() => [
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
  ], []);

  // Vérifier si le membre a une membership pour la saison active
  const activeMembership = member?.memberships?.find(
    (m) => m.seasonId === activeSeason?.id
  );

  // ✅ MAINTENANT on peut faire les returns conditionnels
  if (memberLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // ✅ Gestion du cas où member n'existe pas
  if (!member) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
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
              {canUpdate && activeSeason && member.familyId && (
                <ReconcileFamilySeasonButton 
                  familyId={member.familyId} 
                  seasonId={activeSeason.id} 
                  onSuccess={handleRefreshSuccess} 
                />
              )}
              {canUpdate && (
                <Button onClick={() => setIsEditing(true)} Icon={Pencil} />
              )}
              {canDelete && (
                <Button variant="danger" onClick={handleDeleteRequest} Icon={Trash2} />
              )}
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
                  {member.family ? (
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
                canUpdate && (
                  <>
                    {!activeMembership && (
                      <Button size="sm" onClick={() => setIsAddingMembership(true)} variant="secondary">
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
                )
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
              {isAddingMembership && (
                <MembershipSlideOver
                  memberId={memberId}
                  seasonId={activeSeason.id}
                  onSuccess={handleAddMembershipSuccess}
                  onClose={() => setIsAddingMembership(false)}
                  isOpen={isAddingMembership}
                />
              )}
              {isAddingRegistration && (
                <RegistrationSlideOver
                  memberId={memberId}
                  seasonId={activeSeason.id}
                  defaultDiscount={
                    activeMembership && activeMembership.familyOrder !== 1
                      ? activeSeason.discountPercent
                      : 0
                  }
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
      
      <ConfirmModal
        isOpen={isConfirmModalDeleteRegistrationOpen}
        title="Supprimer l'inscription"
        content="Êtes-vous sûr de vouloir supprimer cette inscription ?"
        onClose={() => {
          setIsConfirmModalDeleteRegistrationOpen(false);
          setSelectedRegistration(null);
        }}
        onConfirm={handleDeleteRegistration}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalDeleteMemberOpen}
        title="Supprimer le membre"
        content="Êtes-vous sûr de vouloir supprimer ce membre ?"
        onClose={() => {
          setIsConfirmModalDeleteMemberOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}