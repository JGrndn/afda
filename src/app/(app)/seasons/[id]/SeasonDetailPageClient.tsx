'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { SeasonForm } from '@/components/season/SeasonForm';
import { useSeason, useSeasonActions } from '@/hooks/season.hook';
import { useWorkshopPriceActions } from '@/hooks/workshopPrice.hook';
import { Button, Card, Column, ConfirmModal, DataTable, ErrorMessage, StatusBadge } from '@/components/ui';
import { UpdateSeasonInput } from '@/lib/schemas/season.input';
import { WorkshopPriceSlideOver } from '@/components/workshop/WorkshopPriceSlideOver';
import { WorkshopPriceWithWorkshopInfoDTO } from '@/lib/dto/workshopPrice.dto';
import { MembershipDTO, MembershipWithMemberDTO } from '@/lib/dto/membership.dto';
import { SeasonWithFullDetailsDTO } from '@/lib/dto/season.dto';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface SeasonDetailPageClientProps {
  initialSeason: SeasonWithFullDetailsDTO;
  userRole: UserRole;
}

export function SeasonDetailPageClient({ 
  initialSeason, 
  userRole 
}: SeasonDetailPageClientProps) {
  const router = useRouter();
  const seasonId = initialSeason.id;
  
  // ✅ Utilisation du hook useSeason() existant
  const { season, isLoading: seasonLoading, mutate } = useSeason(seasonId);
  
  const { update, remove, isLoading: mutationLoading, error } = useSeasonActions();
  const { remove: removePrice } = useWorkshopPriceActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<WorkshopPriceWithWorkshopInfoDTO | null>(null);
  const [isConfirmModalDeleteSeasonOpen, setIsConfirmModalDeleteSeasonOpen] = useState(false);
  const [isConfirmModalDeleteWorkshopPriceOpen, setIsConfirmModalDeleteWorkshopPriceOpen] = useState(false);
  
  // Permissions dérivées du rôle
  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  // ✅ Définir les colonnes AVANT les returns conditionnels
  const priceColumns: Column<WorkshopPriceWithWorkshopInfoDTO>[] = useMemo(() => [
    {
      type: 'computed',
      label: 'Atelier',
      render: (price) => `${price.workshop.name}` || '-',
    },
    {
      type: 'field',
      key: 'amount',
      label: 'Prix (€)',
      render: (price) => `${price.amount} €`,
    },
    ...(canDelete ? [{
      type: 'action' as const,
      label: 'Actions',
      render: (price: WorkshopPriceWithWorkshopInfoDTO) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeletePriceRequest(price)}
            disabled={selectedPrice?.id === price.id}
            Icon={Trash2}
          >
            {selectedPrice?.id === price.id ? 'Suppression...' : ''}
          </Button>
        </div>
      ),
    }] : []),
  ], [canDelete, selectedPrice]);

  const membershipColumns: Column<MembershipWithMemberDTO>[] = useMemo(() => [
    {
      type: 'field',
      key: 'memberName',
      label: 'Membre',
    },
    {
      type: 'field',
      key: 'status',
      label: 'Adhésion',
      render: (v: MembershipDTO) => (
        <StatusBadge status={v.status} type="membership" />
      ),
    },
  ], []);

  const handleUpdate = async (data: UpdateSeasonInput) => {
    await update(seasonId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDeleteRequest = () => {
    setIsConfirmModalDeleteSeasonOpen(true);
  };

  const handleDelete = async () => {
    await remove(seasonId);
    router.push('/seasons');
  };

  const handleAddPriceSuccess = () => {
    mutate();
  };

  const handleDeletePriceRequest = (price: WorkshopPriceWithWorkshopInfoDTO) => {
    setIsConfirmModalDeleteWorkshopPriceOpen(true);
    setSelectedPrice(price);
  };

  const handleDeletePrice = async () => {
    if (!selectedPrice) return;
    try {
      await removePrice(selectedPrice.id);
      mutate();
    } catch (error) {
      console.error('Failed to delete price:', error);
    } finally {
      setSelectedPrice(null);
    }
  };

  // ✅ Returns conditionnels APRÈS tous les hooks
  if (seasonLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <p>Saison introuvable</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/seasons"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Saison {season.startYear} - {season.endYear}
            <StatusBadge type="season" status={season.status} />
          </h1>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
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
        <SeasonForm
          initialData={season}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Détails">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Période</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {season.startYear} - {season.endYear}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Montant Adhésion</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                  {Number(season.membershipAmount)} €
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Réduction</dt>
                <dd className="mt-1">
                  {season.discountPercent} %
                </dd>
              </div>
            </dl>
          </Card>

          <Card
            title="Ateliers de la saison"
            actions={
              canUpdate && !isAddingPrice && (
                <Button size="sm" onClick={() => setIsAddingPrice(true)}>
                  Ajouter un atelier
                </Button>
              )
            }
          >
            <DataTable<WorkshopPriceWithWorkshopInfoDTO>
              data={season.prices}
              columns={priceColumns}
              emptyMessage="Aucun tarif défini"
            />
            {isAddingPrice && (
              <WorkshopPriceSlideOver
                isOpen={isAddingPrice}
                onClose={() => setIsAddingPrice(false)}
                onSuccess={handleAddPriceSuccess}
                seasonId={season.id}
              />
            )}
          </Card>

          <Card title="Membres de la saison">
            <DataTable<MembershipWithMemberDTO>
              data={season.memberships}
              columns={membershipColumns}
              emptyMessage="Aucun membre"
            />
          </Card>
        </div>
      )}
      
      <ConfirmModal
        isOpen={isConfirmModalDeleteWorkshopPriceOpen}
        title="Supprimer l'atelier"
        content="Êtes-vous sûr de vouloir supprimer cet atelier pour cette saison ?"
        onClose={() => {
          setIsConfirmModalDeleteWorkshopPriceOpen(false);
          setSelectedPrice(null);
        }}
        onConfirm={handleDeletePrice}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalDeleteSeasonOpen}
        title="Supprimer la saison"
        content="Êtes-vous sûr de vouloir supprimer cette saison ?"
        onClose={() => {
          setIsConfirmModalDeleteSeasonOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}