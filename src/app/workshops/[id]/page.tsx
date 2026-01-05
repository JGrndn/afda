'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { WorkshopForm } from '@/components/workshop/WorkshopForm';
import { WorkshopPriceForm } from '@/components/workshop/WorkshopPriceForm';
import { useWorkshop, useWorkshopActions, useWorkshopPriceActions } from '@/hooks/workshop.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge } from '@/components/ui';
import { UpdateWorkshopInput, CreateWorkshopPriceInput } from '@/lib/schemas/workshop.input';
import { WorkshopPriceWithSeasonInfoDTO } from '@/lib/dto/workshopPrice.dto';

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const workshopId = parseInt(resolvedParams.id);
  const { workshop, isLoading: workshopLoading, mutate } = useWorkshop(workshopId);

  const { update, remove, isLoading: mutationLoading, error } = useWorkshopActions();
  const { create: createPrice, remove: removePrice } = useWorkshopPriceActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [deletingPriceId, setDeletingPriceId] = useState<number | null>(null);

  const handleUpdate = async (data: UpdateWorkshopInput) => {
    await update(workshopId, data);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    if (
      confirm('Êtes-vous sûr de vouloir supprimer cet atelier ? Tous les prix associés seront également supprimés.')
    ) {
      await remove(workshopId);
      router.push('/workshops');
    }
  };

  const handleAddPrice = async (data: CreateWorkshopPriceInput) => {
    await createPrice(data);
    setIsAddingPrice(false);
    mutate();
  };

  const handleDeletePrice = async (priceId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      return;
    }

    setDeletingPriceId(priceId);
    try {
      await removePrice(priceId);
      mutate();
    } catch (error) {
      console.error('Failed to delete price:', error);
    } finally {
      setDeletingPriceId(null);
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
            onClick={() => handleDeletePrice(price.id)}
            disabled={deletingPriceId === price.id}
            Icon={Trash2}
          >
            {deletingPriceId === price.id ? 'Suppression...' : ''}
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
              <Button variant="danger" onClick={handleDelete} Icon={Trash2}/>
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
                  Ajouter un tarif
                </Button>
              )
            }
          >
            {isAddingPrice ? (
              <WorkshopPriceForm
                initialData={{ workshopId }}
                workshopId={workshopId}
                onSubmit={handleAddPrice}
                onCancel={() => setIsAddingPrice(false)}
              />
            ) : (
              <DataTable<WorkshopPriceWithSeasonInfoDTO>
                data={workshop.prices}
                columns={priceColumns}
                
                emptyMessage="Aucun tarif défini"
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}