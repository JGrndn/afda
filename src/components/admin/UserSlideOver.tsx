'use client';

import { useState, useEffect } from 'react';
import { SlideOver } from '@/components/ui/SlideOver';
import { FormField, Button, ErrorMessage } from '@/components/ui';
import { UserDTO } from '@/lib/dto/user.dto';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { USER_ROLE_TRANSLATIONS } from '@/lib/i18n/translations';

interface UserSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingUser?: UserDTO | null;
}

const ROLE_OPTIONS = Object.values(UserRole).map((role) => ({
  value: role,
  label: USER_ROLE_TRANSLATIONS[role],
}));

const DEFAULT_FORM = {
  name: '',
  email: '',
  password: '',
  role: UserRole.VIEWER,
  isActive: true,
};

export function UserSlideOver({ isOpen, onClose, onSuccess, editingUser }: UserSlideOverProps) {
  const isEditing = !!editingUser;
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name ?? '',
        email: editingUser.email,
        password: '',
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
    } else {
      setFormData({ ...DEFAULT_FORM });
    }
    setError(null);
  }, [editingUser, isOpen]);

  function updateField<K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };

      if (!isEditing || formData.password) {
        payload.password = formData.password;
      }

      const url = isEditing ? `/api/users/${editingUser.id}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inattendue'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Nom complet"
          name="name"
          type="text"
          value={formData.name}
          onChange={(v) => updateField('name', v)}
          required
          placeholder="Prénom Nom"
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(v) => updateField('email', v)}
          required
          placeholder="utilisateur@exemple.fr"
        />
        <FormField
          label={isEditing ? 'Nouveau mot de passe' : 'Mot de passe'}
          name="password"
          type="password"
          value={formData.password}
          onChange={(v) => updateField('password', v)}
          required={!isEditing}
          helpText={isEditing ? 'Laisser vide pour ne pas modifier.' : 'Au moins 6 caractères.'}
        />
        <FormField
          label="Rôle"
          name="role"
          type="select"
          value={formData.role}
          onChange={(v) => updateField('role', v as UserRole)}
          options={ROLE_OPTIONS}
          required
        />
        {isEditing && (
          <FormField
            label="Compte actif"
            name="isActive"
            type="checkbox"
            value={formData.isActive}
            onChange={(v) => updateField('isActive', v)}
            helpText="Décocher pour désactiver l'accès sans supprimer le compte."
          />
        )}

        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-1.5">
          <p className="font-semibold text-gray-700 mb-2">Permissions par rôle :</p>
          <p><span className="font-medium text-red-700">{USER_ROLE_TRANSLATIONS[UserRole.ADMIN]}</span> — Accès complet + gestion des utilisateurs</p>
          <p><span className="font-medium text-blue-700">{USER_ROLE_TRANSLATIONS[UserRole.MANAGER]}</span> — Lecture + création + modification + suppression</p>
          <p><span className="font-medium text-gray-700">{USER_ROLE_TRANSLATIONS[UserRole.VIEWER]}</span> — Lecture seule</p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {isEditing ? 'Enregistrer' : "Créer l'utilisateur"}
          </Button>
        </div>
      </form>
    </SlideOver>
  );
}