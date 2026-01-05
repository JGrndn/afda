'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { WORKSHOP_STATUS } from '@/lib/domain/workshop.enum';
import type { CreateWorkshopInput } from '@/lib/schemas/workshop.input';

interface WorkshopFormProps {
  initialData?: Partial<CreateWorkshopInput>;
  onSubmit: (data: CreateWorkshopInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function WorkshopForm({ initialData, onSubmit, onCancel, isLoading }: WorkshopFormProps) {
  const [formData, setFormData] = useState<CreateWorkshopInput>({
    name: '',
    description: null,
    status: WORKSHOP_STATUS.ACTIVE,
    allowMultiple: false,
    maxPerMember: null,
    ...initialData,
  });

  function updateField<K extends keyof CreateWorkshopInput>(
    field: K,
    value: CreateWorkshopInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const statusOptions = [
    { value: WORKSHOP_STATUS.ACTIVE, label: 'Actif' },
    { value: WORKSHOP_STATUS.INACTIVE, label: 'Inactif' },
  ];

  return (
    <GenericForm
      title={initialData ? 'Modifier Atelier' : 'Nouvel Atelier'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nom"
          name="name"
          type="text"
          value={formData.name}
          onChange={(v) => updateField('name', v)}
          required
        />

        <FormField
          label="Statut"
          name="status"
          type="select"
          value={formData.status}
          onChange={(v) => updateField('status', v)}
          options={statusOptions}
          required
        />

        <div className="md:col-span-2">
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description || ''}
            onChange={(v) => updateField('description', v || null)}
          />
        </div>

        <FormField
          label="Autoriser plusieurs instances"
          name="allowMultiple"
          type="checkbox"
          value={formData.allowMultiple}
          onChange={(v) => updateField('allowMultiple', v)}
          helpText="L'adhérent peut s'inscrire plusieurs fois à cet atelier"
        />

        {formData.allowMultiple && (
          <FormField
            label="Maximum par membre"
            name="maxPerMember"
            type="number"
            value={formData.maxPerMember || ''}
            onChange={(v) => updateField('maxPerMember', v ? parseInt(v.toString()) : null)}
            required={formData.allowMultiple}
            helpText="Nombre maximum d'inscriptions par membre"
          />
        )}
      </div>
    </GenericForm>
  );
}