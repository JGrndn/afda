'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Trash2, RefreshCw } from 'lucide-react';
import { MemberForm } from '@/components/member/MemberForm';
import { useMember, useMemberActions } from '@/hooks/member.hook';
import { useRegistrationActions } from '@/hooks/registration.hook';
import { useSeasons } from '@/hooks/season.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge, ConfirmModal, ActionsDropdown } from '@/components/ui';
import { ActionBar } from '@/components/ui/ActionBar';
import { UpdateMemberInput } from '@/lib/schemas/member.input';
import { RegistrationDTO, RegistrationWithWorkshopDetailsDTO } from '@/lib/dto/registration.dto';
import { MembershipWithSeasonDTO } from '@/lib/dto/membership.dto';
import { MemberWithFullDetailsDTO } from '@/lib/dto/member.dto';
import { RegistrationSlideOver } from '@/components/member/RegistrationSlideOver';
import { MembershipSlideOver } from '@/components/member/MembershipSlideOver';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { SEASON_STATUS } from '@/lib/domain/enums/season.enum';
import { reconcileFamilySeason } from '@/lib/actions/reconcilation.actions';

interface MemberDetailPageClientProps {
  initialMember: MemberWithFullDetailsDTO;
  userRole: UserRole;
}

export function MemberDetailPageClient({ initialMember, userRole }: MemberDetailPageClientProps) {
  const router = useRouter();
  const memberId = initialMember.id;

  const { member, isLoading: memberLoading, mutate } = useMember(memberId);
  const { data: seasons } = useSeasons({ status: SEASON_STATUS.ACTIVE });
  const activeSeason = seasons?.[0];

  const { update, remove, isLoading: mutationLoading, error } = useMemberActions();
  const { remove: removeRegistration } = useRegistrationActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRegistration, setIsAddingRegistration] = useState(false);
  const [isAddingMembership, setIsAddingMembership] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDTO | null>(null);
  const [isConfirmDeleteMemberOpen, setIsConfirmDeleteMemberOpen] = useState(false);
  const [isConfirmDeleteRegistrationOpen, setIsConfirmDeleteRegistrationOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const handleUpdate = async (data: UpdateMemberInput) => {
    await update(memberId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    await remove(memberId);
    router.push('/members');
  };

  const handleReconcile = async () => {
    if (!activeSeason || !member?.familyId) return;
    setIsReconciling(true);
    try { await reconcileFamilySeason(member.familyId, activeSeason.id); await mutate(); }
    finally { setIsReconciling(false); }
  };

  const handleDeleteRegistration = async () => {
    if (!selectedRegistration) return;
    try { await removeRegistration(selectedRegistration.id); mutate(); }
    finally { setSelectedRegistration(null); }
  };

  const registrationColumns: Column<RegistrationWithWorkshopDetailsDTO>[] = useMemo(() => [
    { type: 'computed', label: 'Atelier', render: (r) => r.workshop.name },
    { type: 'field', key: 'quantity', label: 'Quantité' },
    { type: 'field', key: 'totalPrice', label: 'Prix', render: (r) => `${r.totalPrice.toFixed(2)} €` },
    { type: 'field', key: 'discountPercent', label: 'Réduction', render: (r) => `${r.discountPercent}%` },
    ...(canDelete ? [{
      type: 'action' as const, label: 'Actions',
      render: (r: RegistrationWithWorkshopDetailsDTO) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="danger" onClick={() => { setSelectedRegistration(r); setIsConfirmDeleteRegistrationOpen(true); }} Icon={Trash2} />
        </div>
      ),
    }] : []),
  ], [canDelete]);

  const membershipColumns: Column<MembershipWithSeasonDTO>[] = useMemo(() => [
    { type: 'computed', label: 'Saison', render: (m) => `${m.season.startYear} / ${m.season.endYear}` },
    { type: 'field', key: 'amount', label: 'Montant', render: (m) => `${m.amount.toFixed(2)} €` },
    { type: 'field', key: 'status', label: 'Adhésion', render: (m) => <StatusBadge type="membership" status={m.status} /> },
    { type: 'field', key: 'membershipDate', label: 'Date', render: (m) => new Date(m.membershipDate).toLocaleDateString('fr-FR') },
  ], []);

  const activeMembership = member?.memberships?.find(m => m.seasonId === activeSeason?.id);

  const actions = [
    { label: 'Sync', icon: RefreshCw, onClick: handleReconcile, isLoading: isReconciling, hidden: !canUpdate || !activeSeason || !member?.familyId || isEditing },
    { label: 'Modifier', icon: Pencil, onClick: () => setIsEditing(true), hidden: !canUpdate || isEditing },
    { label: 'Supprimer', icon: Trash2, onClick: () => setIsConfirmDeleteMemberOpen(true), variant: 'danger' as const, hidden: !canDelete || isEditing },
  ];

  if (memberLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (!member) return <div className="container mx-auto p-6"><Card><p>Membre introuvable</p></Card></div>;

  return (
    <div className="container mx-auto p-6 max-w-6xl pb-24 sm:pb-6">
      <Link href="/members" className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{member.firstName} {member.lastName}</h1>
          <p className="text-gray-600 mt-1">{member.isMinor ? 'Mineur' : 'Majeur'}</p>
        </div>
        {!isEditing && <ActionsDropdown items={actions} />}
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <MemberForm initialData={member} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} isLoading={mutationLoading} />
      ) : (
        <div className="space-y-6">
          <Card title="Informations personnelles">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><dt className="text-sm font-medium text-gray-500">Nom</dt><dd className="mt-1 text-sm text-gray-900">{member.lastName}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500">Prénom</dt><dd className="mt-1 text-sm text-gray-900">{member.firstName}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500">Email</dt><dd className="mt-1 text-sm text-gray-900">{member.email || '-'}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500">Téléphone</dt><dd className="mt-1 text-sm text-gray-900">{member.phone || '-'}</dd></div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Famille</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {member.family ? (
                    <Link href={`/families/${member.familyId}`} className="text-blue-600 hover:text-blue-800">{member.family.name}</Link>
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
                <div><dt className="text-sm font-medium text-gray-500">Nom</dt><dd className="mt-1 text-sm text-gray-900">{member.guardianLastName || '-'}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Prénom</dt><dd className="mt-1 text-sm text-gray-900">{member.guardianFirstName || '-'}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Téléphone</dt><dd className="mt-1 text-sm text-gray-900">{member.guardianPhone || '-'}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500">Email</dt><dd className="mt-1 text-sm text-gray-900">{member.guardianEmail || '-'}</dd></div>
              </dl>
            </Card>
          )}

          {activeSeason && (
            <Card
              title={`Ateliers - Saison ${activeSeason.startYear}-${activeSeason.endYear}`}
              actions={canUpdate && (
                <>
                  {!activeMembership && (
                    <Button size="sm" onClick={() => setIsAddingMembership(true)} variant="secondary">
                      <Plus className="w-4 h-4 mr-1" />Adhérer à la saison
                    </Button>
                  )}
                  {activeMembership && (
                    <Button size="sm" onClick={() => setIsAddingRegistration(true)}>
                      <Plus className="w-4 h-4 mr-1" />Inscrire à un atelier
                    </Button>
                  )}
                </>
              )}
            >
              {!activeMembership ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Le membre n'a pas encore adhéré à la saison en cours.</p>
                  <p className="text-sm mt-2">Créez d'abord une adhésion pour pouvoir créer des inscriptions.</p>
                </div>
              ) : (
                <DataTable<RegistrationWithWorkshopDetailsDTO> data={member.registrations} columns={registrationColumns} emptyMessage="Aucune inscription" />
              )}
              {isAddingMembership && (
                <MembershipSlideOver memberId={memberId} seasonId={activeSeason.id} onSuccess={async () => { await mutate(); }} onClose={() => setIsAddingMembership(false)} isOpen={isAddingMembership} />
              )}
              {isAddingRegistration && (
                <RegistrationSlideOver memberId={memberId} seasonId={activeSeason.id} defaultDiscount={activeMembership && activeMembership.familyOrder !== 1 ? activeSeason.discountPercent : 0} onSuccess={async () => { await mutate(); }} onClose={() => setIsAddingRegistration(false)} isOpen={isAddingRegistration} />
              )}
            </Card>
          )}

          <Card title="Historique des adhésions">
            <DataTable<MembershipWithSeasonDTO> data={member.memberships as any} columns={membershipColumns} onRowClick={(m) => router.push(`/memberships/${m.id}`)} emptyMessage="Aucune adhésion" />
          </Card>
        </div>
      )}

      {/* Mobile uniquement */}
      <ActionBar items={actions} />

      <ConfirmModal isOpen={isConfirmDeleteRegistrationOpen} title="Supprimer l'inscription" content="Êtes-vous sûr de vouloir supprimer cette inscription ?" onClose={() => { setIsConfirmDeleteRegistrationOpen(false); setSelectedRegistration(null); }} onConfirm={handleDeleteRegistration} />
      <ConfirmModal isOpen={isConfirmDeleteMemberOpen} title="Supprimer le membre" content="Êtes-vous sûr de vouloir supprimer ce membre ?" onClose={() => setIsConfirmDeleteMemberOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}