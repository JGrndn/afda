'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { WorkshopForm } from '@/components/workshop/WorkshopForm';
import { useWorkshop, useWorkshopActions } from '@/hooks/workshop.hook';
import { useWorkshopPriceActions } from '@/hooks/workshopPrice.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge, ConfirmModal } from '@/components/ui';
import { UpdateWorkshopInput } from '@/lib/schemas/workshop.input';
import { WorkshopPriceWithSeasonInfoDTO } from '@/lib/dto/workshopPrice.dto';
import { WorkshopPriceSlideOver } from '@/components/workshop/WorkshopPriceSlideOver';

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const workshopId = parseInt(resolvedParams.id);
  const { workshop, isLoading: workshopLoading, mutate } = useWorkshop(workshopId);

  const { update, remove, isLoading: mutationLoading, error } = useWorkshopActions();
  const { create: createPrice, remove: removePrice } = useWorkshopPriceActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<WorkshopPriceWithSeasonInfoDTO | null>(null);
  const [isConfirmModalDeleteWorkshopOpen, setIsConfirmModalDeleteWorkshopOpen] = useState(false);
  const [isConfirmModalDeleteWorkshopPriceOpen, setIsConfirmModalDeleteWorkshopPriceOpen] = useState(false);

  const handleUpdate = async (data: UpdateWorkshopInput) => {
    await update(workshopId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDeleteRequest = async () => {
    setIsConfirmModalDeleteWorkshopOpen(true);
  };

  const handleDelete = async () => {
    await remove(workshopId);
    router.push('/workshops');
  };

  const handleAddPriceSuccess =  () => {
    mutate();
  };

  const handleDeletePriceRequest = async(price: WorkshopPriceWithSeasonInfoDTO) => {
    setSelectedPrice(price);
    setIsConfirmModalDeleteWorkshopPriceOpen(true);
  }

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

  if (workshopLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <p>Atelier introuvable</p>
        </Card>
      </div>
    );
  }

  const priceColumns: Column<WorkshopPriceWithSeasonInfoDTO>[] = [
    {
      type: 'computed',
      label: 'Saison',
      render: (price) => `${price.season.startYear} - ${price.season.endYear}` || '-',
    },
    {
      type: 'field',
      key: 'amount',
      label: 'Prix (€)',
      render: (price) => `${price.amount} €`,
    },
    {
      type: 'action',
      label: 'Actions',
      render: (price) => (
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
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/workshops"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
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
            {workshop.allowMultiple
              ? `Plusieurs inscriptions autorisées (max ${workshop.maxPerMember})`
              : 'Inscription unique'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)} Icon={Pencil} />
              <Button variant="danger" onClick={handleDeleteRequest} Icon={Trash2}/>
            </>
          )}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <WorkshopForm
          initialData={workshop}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Détails">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom</dt>
                <dd className="mt-1 text-sm text-gray-900">{workshop.name}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{workshop.description || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Inscriptions multiples</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {workshop.allowMultiple ? 'Oui' : 'Non'}
                </dd>
              </div>
              {workshop.allowMultiple && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Maximum par membre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{workshop.maxPerMember}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card
            title="Tarifs par saison"
            actions={
              !isAddingPrice && (
                <Button size="sm" onClick={() => setIsAddingPrice(true)}>
                  Ajouter pour une saison
                </Button>
              )
            }
          >
            <DataTable<WorkshopPriceWithSeasonInfoDTO>
                data={workshop.prices}
                columns={priceColumns}
                
                emptyMessage="Aucun tarif défini"
              />
            {isAddingPrice &&
              <WorkshopPriceSlideOver
                isOpen={isAddingPrice}
                onClose={() => setIsAddingPrice(false)}
                onSuccess={handleAddPriceSuccess}
                worshopId={workshopId}
              />
            }
          </Card>
        </div>
      )}
      <ConfirmModal
        isOpen={isConfirmModalDeleteWorkshopPriceOpen}
        title={"Supprimer pour la saison"}
        content={'Etes-vous sûr de vouloir supprimer cet atelier pour cette saison ?'}
        onClose={() => {
          setIsConfirmModalDeleteWorkshopPriceOpen(false);
          setSelectedPrice(null);
        }}
        onConfirm={handleDeletePrice}
      />
      <ConfirmModal
        isOpen={isConfirmModalDeleteWorkshopOpen}
        title={"Supprimer l'atelier"}
        content={'Etes-vous sûr de vouloir supprimer cet atelier ?'}
        onClose={() => {
          setIsConfirmModalDeleteWorkshopOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}