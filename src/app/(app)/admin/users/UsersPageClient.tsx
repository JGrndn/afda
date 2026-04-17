'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { UserDTO } from '@/lib/dto/user.dto';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import {
  DataTable,
  Button,
  Column,
  ConfirmModal,
  ErrorMessage,
  StatusBadge,
} from '@/components/ui';
import { UserSlideOver } from '@/components/admin/UserSlideOver';
import { Shield, Trash2, UserPlus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UsersPageClientProps {
  currentUserId: string;
}

export function UsersPageClient({ currentUserId }: UsersPageClientProps) {
  const { data: users, isLoading, mutate } = useSWR<UserDTO[]>('/api/users', fetcher);

  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleEdit = (user: UserDTO) => {
    setEditingUser(user);
    setIsSlideOverOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/users/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Erreur lors de la suppression');
        return;
      }
      await mutate();
    } catch {
      setActionError('Erreur réseau');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (user: UserDTO) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Erreur');
        return;
      }
      await mutate();
    } catch {
      setActionError('Erreur réseau');
    }
  };

  const handleSlideOverClose = () => {
    setIsSlideOverOpen(false);
    setEditingUser(null);
  };

  const columns: Column<UserDTO>[] = useMemo(
    () => [
      {
        type: 'computed',
        label: 'Utilisateur',
        render: (u) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{u.name ?? '—'}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </div>
            {u.id === currentUserId && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Vous
              </span>
            )}
          </div>
        ),
      },
      {
        type: 'computed',
        label: 'Rôle',
        render: (u) => <StatusBadge type="userRole" status={u.role} />,
      },
      {
        type: 'computed',
        label: 'Statut',
        render: (u) => (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              u.isActive ? 'text-green-700' : 'text-red-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
            {u.isActive ? 'Actif' : 'Désactivé'}
          </span>
        ),
      },
      {
        type: 'computed',
        label: 'Créé le',
        render: (u) => (
          <span className="text-sm text-gray-500">
            {new Date(u.createdAt).toLocaleDateString('fr-FR')}
          </span>
        ),
      },
      {
        type: 'action',
        label: 'Actions',
        render: (u) => (
          <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" Icon={Pencil} onClick={() => handleEdit(u)} title="Modifier" />
            <Button
              size="icon"
              variant="ghost"
              Icon={u.isActive ? ToggleRight : ToggleLeft}
              onClick={() => handleToggleActive(u)}
              title={u.isActive ? 'Désactiver' : 'Activer'}
              className={u.isActive ? 'text-green-600' : 'text-gray-400'}
              disabled={u.id === currentUserId}
            />
            <Button
              size="icon"
              variant="ghostdanger"
              Icon={Trash2}
              onClick={() => handleDeleteRequest(u.id)}
              title="Supprimer"
              disabled={u.id === currentUserId}
            />
          </div>
        ),
      },
    ],
    [currentUserId]
  );

  const stats = useMemo(() => {
    if (!users) return null;
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      admins: users.filter((u) => u.role === UserRole.ADMIN).length,
      managers: users.filter((u) => u.role === UserRole.MANAGER).length,
    };
  }, [users]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Créez et gérez les accès à l'application.</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setIsSlideOverOpen(true); }} Icon={UserPlus}>
          Nouvel utilisateur
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-white' },
            { label: 'Actifs', value: stats.active, color: 'bg-green-50' },
            { label: 'Administrateurs', value: stats.admins, color: 'bg-red-50' },
            { label: 'Gestionnaires', value: stats.managers, color: 'bg-blue-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-lg shadow-sm p-4 text-center`}>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {actionError && (
        <div className="mb-4">
          <ErrorMessage error={new Error(actionError)} />
        </div>
      )}

      <DataTable<UserDTO>
        data={users}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Aucun utilisateur"
      />

      <UserSlideOver
        isOpen={isSlideOverOpen}
        onClose={handleSlideOverClose}
        onSuccess={() => mutate()}
        editingUser={editingUser}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Supprimer l'utilisateur"
        content="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        onClose={() => { setIsConfirmOpen(false); setDeletingId(null); }}
        onConfirm={handleDelete}
      />
    </div>
  );
}