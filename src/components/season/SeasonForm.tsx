'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { SEASON_STATUS } from '@/lib/schemas/season.schema';

interface SeasonFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SeasonForm({ initialData, onSubmit, onCancel, isLoading }: SeasonFormProps) {
  const [formData, setFormData] = useState({
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 1,
    status: SEASON_STATUS.INACTIVE,
    membershipAmount: 0,
    discountPercent:0,
    ...initialData,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev:any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <GenericForm
      title={initialData ? 'Editer Saison' : 'Nouvelle Saison'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Année de début"
          name="startYear"
          type="number"
          value={formData.startYear}
          onChange={(v) => updateField('startYear', v)}
          required
        />

        <FormField
          label="Année de fin"
          name="endYear"
          type="number"
          value={formData.endYear}
          onChange={(v) => updateField('endYear', v)}
          required
        />

        <FormField
          label="Montant adhésion (€)"
          name="membershipAmount"
          type="number"
          value={formData.membershipAmount}
          onChange={(v) => updateField('membershipAmount', v)}
          required
        />

        <FormField
          label="Réduction (%)"
          name="discountPercent"
          type="number"
          value={formData.discountPercent}
          onChange={(v) => updateField('discountPercent', v)}
          required
          helpText="Réduction à appliquer si plusieurs adhésions par famille"
        />
      </div>
    </GenericForm>
  );
}