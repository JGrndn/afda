'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import type { CreateFamilyInput } from '@/lib/schemas/family.input';

interface FamilyFormProps {
  initialData?: Partial<CreateFamilyInput>;
  onSubmit: (data: CreateFamilyInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function FamilyForm({ initialData, onSubmit, onCancel, isLoading }: FamilyFormProps) {
  const [formData, setFormData] = useState<CreateFamilyInput>({
    name: '',
    address: null,
    phone: null,
    email: null,
    ...initialData,
  });

  function updateField<K extends keyof CreateFamilyInput>(
    field: K,
    value: CreateFamilyInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <GenericForm
      title={initialData ? 'Modifier Famille' : 'Nouvelle Famille'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nom de famille"
          name="name"
          type="text"
          value={formData.name}
          onChange={(v) => updateField('name', v)}
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

        <div className="md:col-span-2">
          <FormField
            label="Adresse"
            name="address"
            type="textarea"
            value={formData.address || ''}
            onChange={(v) => updateField('address', v || null)}
          />
        </div>
      </div>
    </GenericForm>
  );
}