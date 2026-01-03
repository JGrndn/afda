'use client';

import { useState, useEffect } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useWorkshops } from '@/hooks/workshop.hook';
import { useSeasons } from '@/hooks/season.hook';
import type { CreateRegistrationInput } from '@/lib/schemas/registration.input';

interface RegistrationFormProps {
  initialData?: Partial<CreateRegistrationInput>;
  onSubmit: (data: CreateRegistrationInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  memberId: number;
  seasonId?: number;
}

export function RegistrationForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  memberId,
  seasonId,
}: RegistrationFormProps) {
  const { data: workshops } = useWorkshops({ status: 'active' });
  const { data: seasons } = useSeasons();

  const [formData, setFormData] = useState<CreateRegistrationInput>({
    memberId,
    seasonId: seasonId || 0,
    workshopId: 0,
    quantity: 1,
    appliedPrice: 0,
    discountPercent: 0,
    ...initialData,
  });

  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);

  useEffect(() => {
    if (formData.workshopId && workshops) {
      const workshop = workshops.find((w) => w.id === formData.workshopId);
      setSelectedWorkshop(workshop);
    }
  }, [formData.workshopId, workshops]);

  function updateField<K extends keyof CreateRegistrationInput>(
    field: K,
    value: CreateRegistrationInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const workshopOptions =
    workshops?.map((w) => ({
      value: w.id,
      label: w.name,
    })) || [];

  const seasonOptions =
    seasons?.map((s) => ({
      value: s.id,
      label: `${s.startYear}-${s.endYear}`,
    })) || [];

  return (
    <GenericForm
      title={initialData ? 'Modifier Inscription Atelier' : 'Nouvelle Inscription Atelier'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Saison"
          name="seasonId"
          type="select"
          value={formData.seasonId}
          onChange={(v) => updateField('seasonId', parseInt(v))}
          options={seasonOptions}
          required
          disabled={!!seasonId}
        />

        <FormField
          label="Atelier"
          name="workshopId"
          type="select"
          value={formData.workshopId}
          onChange={(v) => updateField('workshopId', parseInt(v))}
          options={workshopOptions}
          required
        />

        {selectedWorkshop?.allowMultiple && (
          <FormField
            label="Quantité"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={(v) => updateField('quantity', parseInt(v.toString()))}
            required
            helpText={`Maximum: ${selectedWorkshop.maxPerMember || 'illimité'}`}
          />
        )}

        <FormField
          label="Prix appliqué (€)"
          name="appliedPrice"
          type="number"
          value={formData.appliedPrice}
          onChange={(v) => updateField('appliedPrice', parseFloat(v.toString()))}
          required
        />

        <FormField
          label="Réduction (%)"
          name="discountPercent"
          type="number"
          value={formData.discountPercent}
          onChange={(v) => updateField('discountPercent', parseFloat(v.toString()))}
          helpText="Réduction familiale ou autre"
        />
      </div>
    </GenericForm>
  );
}