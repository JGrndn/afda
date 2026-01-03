'use client';

import { useState, useEffect } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useWorkshops } from '@/hooks/workshop.hook';
import { useRegistrationActions } from '@/hooks/registration.hook';
import { useSeasons } from '@/hooks/season.hook';
import type { CreateRegistrationInput } from '@/lib/schemas/registration.input';

interface RegistrationFormProps {
  memberId: number;
  seasonId: number;
  defaultDiscount?: number;
  onSubmit?: (data: CreateRegistrationInput) => Promise<void>;
  onCancel?: () => void;
}

export function RegistrationForm({
  memberId,
  seasonId,
  defaultDiscount=0,
  onSubmit,
  onCancel,
}: RegistrationFormProps) {
  const { data: workshops } = useWorkshops({ status: 'active'});
  const { data: seasons } = useSeasons();
  const { create, isLoading, error } = useRegistrationActions();

  console.log(workshops);
  const [formData, setFormData] = useState<CreateRegistrationInput>({
    memberId,
    seasonId,
    workshopId: 0,
    quantity: 1,
    appliedPrice: 0,
    discountPercent: defaultDiscount,
  });

  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);

  // Récupérer la saison pour obtenir le discountPercent
  const selectedSeason = seasons?.find((s) => s.id === seasonId);

  useEffect(() => {
    if (formData.workshopId && workshops) {
      const workshop = workshops.find((w) => w.id === formData.workshopId);
      setSelectedWorkshop(workshop);

      // Si le workshop a des prix, récupérer le prix pour la saison
      if (workshop && 'prices' in workshop) {
        const workshopWithPrices = workshop as any;
        const priceForSeason = workshopWithPrices.prices?.find(
          (p: any) => p.seasonId === seasonId
        );
        if (priceForSeason) {
          setFormData((prev) => ({
            ...prev,
            appliedPrice: priceForSeason.amount,
            discountPercent: selectedSeason?.discountPercent || 0,
          }));
        }
      }
    }
  }, [formData.workshopId, workshops, seasonId, selectedSeason]);

  function updateField<K extends keyof CreateRegistrationInput>(
    field: K,
    value: CreateRegistrationInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create(formData);
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (err) {
      console.error('Failed to create registration:', err);
    }
  };

  const workshopOptions =
    workshops?.map((w) => ({
      value: w.id,
      label: w.name,
    })) || [];

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error.message}</div>
      )}
      <GenericForm
        title="Inscrire à un atelier"
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
        submitLabel="Inscrire"
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
            helpText="Réduction familiale appliquée"
          />
        </div>
      </GenericForm>
    </div>
  );
}