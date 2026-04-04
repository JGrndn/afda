'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import type { CreateClientInput } from '@/lib/schemas/client.input';

interface ClientFormProps {
  initialData?: Partial<CreateClientInput>;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ClientForm({ initialData, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const [formData, setFormData] = useState<CreateClientInput>({
    name: '',
    address: null,
    phone: null,
    email: null,
    contact: null,
    ...initialData,
  });

  function updateField<K extends keyof CreateClientInput>(
    field: K,
    value: CreateClientInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <GenericForm
      title={initialData?.name ? 'Modifier le client' : 'Nouveau client'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormField
            label="Nom de l'organisme"
            name="name"
            type="text"
            value={formData.name}
            onChange={(v) => updateField('name', v)}
            required
            placeholder="Commune de..., Association..."
          />
        </div>

        <FormField
          label="Contact"
          name="contact"
          type="text"
          value={formData.contact || ''}
          onChange={(v) => updateField('contact', v || null)}
          placeholder="Nom du référent"
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