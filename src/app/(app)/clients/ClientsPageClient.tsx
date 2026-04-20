'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ClientDTO } from '@/lib/dto/client.dto';
import { DataTable, Button, ErrorMessage, Column, ConfirmModal, FormField } from '@/components/ui';
import { ClientSlideOver } from '@/components/client/ClientSlideOver';
import { useClients, useClientActions } from '@/hooks/client.hook';
import { Building2, Trash2 } from 'lucide-react';
import { UserRole, UserRolePermissions } from '@/lib/domain/enums/user-role.enum';

interface ClientsPageClientProps {
  userRole: UserRole;
}

export function ClientsPageClient({ userRole }: ClientsPageClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: clients, isLoading, mutate } = useClients({ search });
  const { remove, error } = useClientActions();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const canCreate = UserRolePermissions.canCreate(userRole);
  const canDelete = UserRolePermissions.canDelete(userRole);

  const handleDeleteRequest = (id: number) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await remove(deletingId);
      await mutate();
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<ClientDTO>[] = useMemo(
    () => [
      { type: 'field', key: 'name', label: 'Organisme' },
      {
        type: 'field',
        key: 'contact',
        label: 'Contact',
        render: (c) => c.contact || '-',
      },
      {
        type: 'field',
        key: 'email',
        label: 'Email',
        render: (c) => c.email || '-',
      },
      {
        type: 'field',
        key: 'phone',
        label: 'Téléphone',
        render: (c) => c.phone || '-',
      },
      ...(canDelete
        ? [
            {
              type: 'action' as const,
              label: 'Actions',
              render: (client: ClientDTO) => (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="softdanger"
                    Icon={Trash2}
                    onClick={() => handleDeleteRequest(client.id)}
                    disabled={deletingId === client.id}
                  />
                </div>
              ),
            },
          ]
        : []),
    ],
    [canDelete, deletingId]
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        {canCreate && (
          <Button onClick={() => setIsSlideOverOpen(true)} Icon={Building2}>
            Nouveau client
          </Button>
        )}
      </div>

      {error && <ErrorMessage error={error} />}

      <div className="mb-4">
        <FormField
          name="search"
          type="text"
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un client..."
          compact
        />
      </div>

      <DataTable
        data={clients}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Aucun client"
        onRowClick={(c) => router.push(`/clients/${c.id}`)}
      />

      <ClientSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSuccess={() => mutate()}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Supprimer le client"
        content="Êtes-vous sûr de vouloir supprimer ce client ? Tous ses devis seront également supprimés."
        onClose={() => { setIsConfirmOpen(false); setDeletingId(null); }}
        onConfirm={handleDelete}
      />
    </div>
  );
}