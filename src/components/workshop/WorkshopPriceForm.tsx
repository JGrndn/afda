'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useWorkshops } from '@/hooks/workshop.hook';
import { useSeasons } from '@/hooks/season.hook';
import type { CreateWorkshopPriceInput } from '@/lib/schemas/workshop.input';

interface WorkshopPriceFormProps {
  initialData?: Partial<CreateWorkshopPriceInput>;
  onSubmit: (data: CreateWorkshopPriceInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  workshopId?: number; // Si fourni, le champ workshop est disabled
  seasonId?: number; // Si fourni, le champ season est disabled
}

export function WorkshopPriceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  workshopId,
  seasonId,
}: WorkshopPriceFormProps) {
  const { data: workshops } = useWorkshops();
  const { data: seasons } = useSeasons();

  const [formData, setFormData] = useState<CreateWorkshopPriceInput>({
    workshopId: workshopId || 0,
    seasonId: seasonId || 0,
    amount: 0,
    ...initialData,
  });

  function updateField<K extends keyof CreateWorkshopPriceInput>(
    field: K,
    value: CreateWorkshopPriceInput[K]
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
      title={initialData ? 'Modifier Prix' : 'Nouveau Prix'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Atelier"
          name="workshopId"
          type="select"
          value={formData.workshopId}
          onChange={(v) => updateField('workshopId', parseInt(v))}
          options={workshopOptions}
          required
          disabled={!!workshopId}
        />

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
          label="Prix (€)"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={(v) => updateField('amount', parseFloat(v.toString()))}
          required
        />
      </div>
    </GenericForm>
  );
}