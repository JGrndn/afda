'use client';

import { useState, useEffect } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useFamilies } from '@/hooks/family';
import type { CreateMemberInput } from '@/lib/schemas/member.input';

interface MemberFormProps {
  initialData?: Partial<CreateMemberInput>;
  onSubmit: (data: CreateMemberInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MemberForm({ initialData, onSubmit, onCancel, isLoading }: MemberFormProps) {
  const { data: families } = useFamilies();
  
  const [formData, setFormData] = useState<CreateMemberInput>({
    familyId: null,
    lastName: '',
    firstName: '',
    isMinor: false,
    email: null,
    phone: null,
    guardianLastName: null,
    guardianFirstName: null,
    guardianPhone: null,
    guardianEmail: null,
    ...initialData,
  });

  function updateField<K extends keyof CreateMemberInput>(
    field: K,
    value: CreateMemberInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const familyOptions = families?.map((f) => ({
    value: f.id,
    label: f.name,
  })) || [];

  return (
    <GenericForm
      title={initialData ? 'Modifier Membre' : 'Nouveau Membre'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Informations personnelles */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Informations personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nom"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={(v) => updateField('lastName', v)}
              required
            />

            <FormField
              label="Prénom"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={(v) => updateField('firstName', v)}
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={(v) => updateField('email', v || null)}
            />

            <FormField
              label="Téléphone"
              name="phone"
              type="text"
              value={formData.phone || ''}
              onChange={(v) => updateField('phone', v || null)}
            />

            <FormField
              label="Famille"
              name="familyId"
              type="select"
              value={formData.familyId || ''}
              onChange={(v) => updateField('familyId', v ? parseInt(v) : null)}
              options={familyOptions}
            />

            <FormField
              label="Mineur"
              name="isMinor"
              type="checkbox"
              value={formData.isMinor}
              onChange={(v) => updateField('isMinor', v)}
            />
          </div>
        </div>

        {/* Informations tuteur (si mineur) */}
        {formData.isMinor && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Informations du tuteur légal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nom du tuteur"
                name="guardianLastName"
                type="text"
                value={formData.guardianLastName || ''}
                onChange={(v) => updateField('guardianLastName', v || null)}
                required={formData.isMinor}
              />

              <FormField
                label="Prénom du tuteur"
                name="guardianFirstName"
                type="text"
                value={formData.guardianFirstName || ''}
                onChange={(v) => updateField('guardianFirstName', v || null)}
              />

              <FormField
                label="Téléphone du tuteur"
                name="guardianPhone"
                type="text"
                value={formData.guardianPhone || ''}
                onChange={(v) => updateField('guardianPhone', v || null)}
              />

              <FormField
                label="Email du tuteur"
                name="guardianEmail"
                type="email"
                value={formData.guardianEmail || ''}
                onChange={(v) => updateField('guardianEmail', v || null)}
              />
            </div>
          </div>
        )}
      </div>
    </GenericForm>
  );
}