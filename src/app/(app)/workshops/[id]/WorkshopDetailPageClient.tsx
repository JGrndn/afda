'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { WorkshopForm } from '@/components/workshop/WorkshopForm';
import { useWorkshop, useWorkshopActions } from '@/hooks/workshop.hook';
import { useWorkshopPriceActions } from '@/hooks/workshopPrice.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge, ConfirmModal, ActionsDropdown } from '@/components/ui';
import { ActionBar } from '@/components/ui/ActionBar';
import { UpdateWorkshopInput } from '@/lib/schemas/workshop.input';
import { WorkshopPriceWithSeasonInfoDTO } from '@/lib/dto/workshopPrice.dto';
import { WorkshopWithPricesAndSeasonDTO } from '@/lib/dto/workshop.dto';
import { WorkshopPriceSlideOver } from '@/components/workshop/WorkshopPriceSlideOver';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';
import { AuditLogButton } from '@/components/audit/AuditLogButton';

interface WorkshopDetailPageClientProps {
  initialWorkshop: WorkshopWithPricesAndSeasonDTO;
  userRole: UserRole;
}

export function WorkshopDetailPageClient({ initialWorkshop, userRole }: WorkshopDetailPageClientProps) {
  const router = useRouter();
  const workshopId = initialWorkshop.id;

  const { workshop, isLoading: workshopLoading, mutate } = useWorkshop(workshopId);
  const { update, remove, isLoading: mutationLoading, error } = useWorkshopActions();
  const { remove: removePrice } = useWorkshopPriceActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<WorkshopPriceWithSeasonInfoDTO | null>(null);
  const [isConfirmDeleteWorkshopOpen, setIsConfirmDeleteWorkshopOpen] = useState(false);
  const [isConfirmDeletePriceOpen, setIsConfirmDeletePriceOpen] = useState(false);

  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const priceColumns: Column<WorkshopPriceWithSeasonInfoDTO>[] = useMemo(() => [
    { type: 'computed', label: 'Saison', render: (p) => `${p.season.startYear} - ${p.season.endYear}` },
    { type: 'field', key: 'amount', label: 'Prix (€)', render: (p) => `${p.amount} €` },
    ...(canDelete ? [{
      type: 'action' as const, label: 'Actions',
      render: (p: WorkshopPriceWithSeasonInfoDTO) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="softdanger" onClick={() => { setSelectedPrice(p); setIsConfirmDeletePriceOpen(true); }} disabled={selectedPrice?.id === p.id} Icon={Trash2} />
        </div>
      ),
    }] : []),
  ], [canDelete, selectedPrice]);

  const handleUpdate = async (data: UpdateWorkshopInput) => {
    await update(workshopId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    await remove(workshopId);
    router.push('/workshops');
  };

  const handleDeletePrice = async () => {
    if (!selectedPrice) return;
    try { await removePrice(selectedPrice.id); mutate(); }
    finally { setSelectedPrice(null); }
  };

  const actions = [
    { label: 'Modifier', icon: Pencil, onClick: () => setIsEditing(true), hidden: !canUpdate || isEditing },
    { label: 'Supprimer', icon: Trash2, onClick: () => setIsConfirmDeleteWorkshopOpen(true), variant: 'danger' as const, hidden: !canDelete || isEditing },
  ];

  if (workshopLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (!workshop) return <div className="container mx-auto p-6"><Card><p>Atelier introuvable</p></Card></div>;

  return (
    <div className="container mx-auto p-6 max-w-6xl pb-24 sm:pb-6">
      <Link href="/workshops" className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Atelier : {workshop.name}
            <StatusBadge type="workshop" status={workshop.status} />
          </h1>
          <p className="text-gray-600 mt-1">
            {workshop.allowMultiple ? `Plusieurs inscriptions autorisées (max ${workshop.maxPerMember})` : 'Inscription unique'}
          </p>
        </div>
        {/* Historique — MANAGER/ADMIN uniquement, desktop uniquement */}
        {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
          <AuditLogButton entityType="workshop" entityId={workshopId} />
        )}

        {!isEditing && <ActionsDropdown items={actions} />}
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <WorkshopForm initialData={workshop} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} isLoading={mutationLoading} />
      ) : (
        <div className="space-y-6">
          <Card title="Détails">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><dt className="text-sm font-medium text-gray-500">Nom</dt><dd className="mt-1 text-sm text-gray-900">{workshop.name}</dd></div>
              <div className="md:col-span-2"><dt className="text-sm font-medium text-gray-500">Description</dt><dd className="mt-1 text-sm text-gray-900">{workshop.description || '-'}</dd></div>
              <div><dt className="text-sm font-medium text-gray-500">Inscriptions multiples</dt><dd className="mt-1 text-sm text-gray-900">{workshop.allowMultiple ? 'Oui' : 'Non'}</dd></div>
              {workshop.allowMultiple && (
                <div><dt className="text-sm font-medium text-gray-500">Maximum par membre</dt><dd className="mt-1 text-sm text-gray-900">{workshop.maxPerMember}</dd></div>
              )}
            </dl>
          </Card>

          <Card
            title="Tarifs par saison"
            actions={canUpdate && !isAddingPrice && <Button size="sm" onClick={() => setIsAddingPrice(true)}>Ajouter pour une saison</Button>}
          >
            <DataTable<WorkshopPriceWithSeasonInfoDTO> data={workshop.prices} columns={priceColumns} emptyMessage="Aucun tarif défini" />
            {isAddingPrice && (
              <WorkshopPriceSlideOver isOpen={isAddingPrice} onClose={() => setIsAddingPrice(false)} onSuccess={() => mutate()} worshopId={workshopId} />
            )}
          </Card>
        </div>
      )}

      {/* Mobile uniquement */}
      <ActionBar items={actions} />

      <ConfirmModal isOpen={isConfirmDeletePriceOpen} title="Supprimer pour la saison" content="Êtes-vous sûr de vouloir supprimer cet atelier pour cette saison ?" onClose={() => { setIsConfirmDeletePriceOpen(false); setSelectedPrice(null); }} onConfirm={handleDeletePrice} />
      <ConfirmModal isOpen={isConfirmDeleteWorkshopOpen} title="Supprimer l'atelier" content="Êtes-vous sûr de vouloir supprimer cet atelier ?" onClose={() => setIsConfirmDeleteWorkshopOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}