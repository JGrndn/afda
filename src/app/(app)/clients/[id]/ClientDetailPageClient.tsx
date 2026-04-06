'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { ClientForm } from '@/components/client/ClientForm';
import { QuoteSlideOver } from '@/components/quote/QuoteSlideOver';
import { InvoiceStatusCell } from '@/components/quote/InvoiceStatusCell';
import { useClient, useClientActions } from '@/hooks/client.hook';
import { Button, Card, ErrorMessage, DataTable, Column, StatusBadge, ConfirmModal } from '@/components/ui';
import { ClientWithQuotesDTO, ClientQuoteSummaryDTO } from '@/lib/dto/client.dto';
import { UpdateClientInput } from '@/lib/schemas/client.input';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface ClientDetailPageClientProps {
  initialClient: ClientWithQuotesDTO;
  userRole: UserRole;
}

export function ClientDetailPageClient({ initialClient, userRole }: ClientDetailPageClientProps) {
  const router = useRouter();
  const { client, isLoading, mutate } = useClient(initialClient.id);
  const { update, remove, isLoading: mutationLoading, error } = useClientActions();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const canUpdate = UserRolePermissions.canEdit(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const data = client ?? initialClient;

  const handleUpdate = async (input: UpdateClientInput) => {
    await update(data.id, input);
    setIsEditing(false);
    mutate();
  };

  const handleDelete = async () => {
    await remove(data.id);
    router.push('/clients');
  };

  const quoteColumns: Column<ClientQuoteSummaryDTO>[] = useMemo(
    () => [
      {
        type: 'field',
        key: 'quoteNumber',
        label: 'N°',
        render: (q) => q.quoteNumber ?? '—',
      },
      { type: 'field', key: 'title', label: 'Titre' },
      {
        type: 'field',
        key: 'totalAmount',
        label: 'Montant',
        render: (q) => `${q.totalAmount.toFixed(2)} €`,
      },
      {
        type: 'field',
        key: 'status',
        label: 'Statut devis',
        render: (q) => <StatusBadge type="quote" status={q.status as any} />,
      },
      {
        type: 'computed',
        label: 'Facture',
        render: (q) => (
          <InvoiceStatusCell
            invoiceStatus={q.invoiceStatus}
            invoicePaidAt={q.invoicePaidAt}
          />
        ),
      },
      {
        type: 'field',
        key: 'issuedAt',
        label: 'Émis le',
        render: (q) =>
          q.issuedAt ? new Date(q.issuedAt).toLocaleDateString('fr-FR') : '—',
      },
      {
        type: 'field',
        key: 'validUntil',
        label: 'Valable jusqu\'au',
        render: (q) =>
          q.validUntil ? new Date(q.validUntil).toLocaleDateString('fr-FR') : '—',
      },
    ],
    []
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href="/clients"
        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{data.name}</h1>
        <div className="flex gap-2">
          {!isEditing && canUpdate && (
            <Button onClick={() => setIsEditing(true)} Icon={Pencil} />
          )}
          {!isEditing && canDelete && (
            <Button
              variant="danger"
              onClick={() => setIsConfirmDeleteOpen(true)}
              Icon={Trash2}
            />
          )}
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {isEditing ? (
        <ClientForm
          initialData={data}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={mutationLoading}
        />
      ) : (
        <div className="space-y-6">
          <Card title="Informations">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.contact || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.phone || '—'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {data.address || '—'}
                </dd>
              </div>
            </dl>
          </Card>

          <Card
            title="Devis"
            actions={
              canUpdate && (
                <Button size="sm" onClick={() => setIsAddingQuote(true)} Icon={Plus}>
                  Nouveau devis
                </Button>
              )
            }
          >
            <DataTable<ClientQuoteSummaryDTO>
              data={data.quotes}
              columns={quoteColumns}
              emptyMessage="Aucun devis pour ce client"
              onRowClick={(q) => router.push(`/quotes/${q.id}`)}
            />
          </Card>
        </div>
      )}

      <QuoteSlideOver
        isOpen={isAddingQuote}
        onClose={() => setIsAddingQuote(false)}
        onSuccess={() => mutate()}
        clientId={data.id}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Supprimer le client"
        content={`Supprimer "${data.name}" ? Tous ses devis seront également supprimés.`}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}