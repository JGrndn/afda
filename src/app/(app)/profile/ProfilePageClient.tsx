'use client';

import { useState } from 'react';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { Card, Button, ErrorMessage, StatusBadge } from '@/components/ui';
import { FormField } from '@/components/ui';
import { User, Lock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfilePageClientProps {
  initialName: string;
  initialEmail: string;
  userRole: string;
}

export function ProfilePageClient({ initialName, initialEmail, userRole }: ProfilePageClientProps) {
  const router = useRouter();

  // ── Info form ──────────────────────────────
  const [name, setName] = useState(initialName);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<Error | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  // ── Password form ──────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<Error | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(false);
    setNameLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setNameError(err instanceof Error ? err : new Error('Erreur inattendue'));
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError(new Error('Les nouveaux mots de passe ne correspondent pas'));
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError(new Error('Le nouveau mot de passe doit contenir au moins 6 caractères'));
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors du changement de mot de passe');
      }
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err : new Error('Erreur inattendue'));
    } finally {
      setPwLoading(false);
    }
  };

  const avatarLetter = (name || initialEmail || 'U')[0].toUpperCase();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          Mon profil
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gérez vos informations personnelles et votre mot de passe.
        </p>
      </div>

      {/* Avatar + role */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {avatarLetter}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{name || '—'}</p>
          <p className="text-sm text-gray-500">{initialEmail}</p>
          <div className="mt-2">
            <StatusBadge type="userRole" status={userRole as UserRole} />
          </div>
        </div>
      </div>

      {/* Name form */}
      <Card title="Informations personnelles">
        <form onSubmit={handleNameSubmit} className="space-y-4" suppressHydrationWarning>
          {nameError && <ErrorMessage error={nameError} />}
          {nameSuccess && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-md text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Nom mis à jour avec succès.
            </div>
          )}
          <FormField
            label="Nom complet"
            name="name"
            type="text"
            value={name}
            onChange={setName}
            required
            placeholder="Prénom Nom"
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={initialEmail}
            onChange={() => {}}
            disabled
            helpText="L'email ne peut pas être modifié ici. Contactez un administrateur."
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={nameLoading}>
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </Card>

      {/* Password form */}
      <div className="mt-6">
        <Card title="Changer le mot de passe">
          <form onSubmit={handlePasswordSubmit} className="space-y-4" suppressHydrationWarning>
            {pwError && <ErrorMessage error={pwError} />}
            {pwSuccess && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-md text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Mot de passe modifié avec succès.
              </div>
            )}
            <FormField
              label="Mot de passe actuel"
              name="currentPassword"
              type="password"
              value={pwForm.currentPassword}
              onChange={(v) => setPwForm((p) => ({ ...p, currentPassword: v }))}
              required
            />
            <FormField
              label="Nouveau mot de passe"
              name="newPassword"
              type="password"
              value={pwForm.newPassword}
              onChange={(v) => setPwForm((p) => ({ ...p, newPassword: v }))}
              required
              helpText="Au moins 6 caractères."
            />
            <FormField
              label="Confirmer le nouveau mot de passe"
              name="confirmPassword"
              type="password"
              value={pwForm.confirmPassword}
              onChange={(v) => setPwForm((p) => ({ ...p, confirmPassword: v }))}
              required
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={pwLoading} Icon={Lock}>
                Changer le mot de passe
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}