'use client';

import { useState, useMemo } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useRegistrationActions } from '@/hooks/registration.hook';
import { useSeason } from '@/hooks/season.hook';
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
  const { season, isError, isLoading, mutate } = useSeason(seasonId); // faire la requête depuis Season, puisqu'on a les prix et les workshops
  const { create, isLoading: isLoadingAction, error } = useRegistrationActions();

  const workshops = useMemo(() => {
    return season?.prices.map(p => ({
      id: p.workshopId,
      name: p.workshop.name,
      allowMultiple: p.workshop.allowMultiple,
      maxPerMember: p.workshop.maxPerMember,
      amount: p.amount,
    })) ?? [];
  }, [season?.prices]);

  const [formData, setFormData] = useState<CreateRegistrationInput>({
    memberId,
    seasonId,
    workshopId: 0,
    quantity: 1,
    totalPrice: 0,
    discountPercent: defaultDiscount,
  });

  const selectedWorkshop = useMemo(() => {
    return workshops.find(w => w.id === formData.workshopId);
  }, [workshops, formData.workshopId]);

  const totalPrice = useMemo(() => {
    if (!selectedWorkshop) return 0;

    const basePrice = selectedWorkshop.amount * formData.quantity;
    const discountFactor = 1 - formData.discountPercent / 100;

    return Math.round(basePrice * discountFactor );
  }, [
    selectedWorkshop,
    formData.quantity,
    formData.discountPercent,
  ]);

  function updateField<K extends keyof CreateRegistrationInput>(
    field: K,
    value: CreateRegistrationInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: CreateRegistrationInput = {
        ...formData,
        totalPrice, // rajout de totalPrice car n'est pas mis à jour dans FormData sur les events
      }
      await create(payload);
      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (err) {
      console.error('Failed to create registration:', err);
    }
  };

  const workshopOptions = // trouver les workshops actifs pour la saison
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
            name="totalPrice"
            type="number"
            value={totalPrice}
            onChange={(v) => updateField('totalPrice', parseFloat(v.toString()))} // jamais appelé car champ désactivé
            required
            disabled
          />

          <FormField
            label="Réduction (%)"
            name="discountPercent"
            type="number"
            value={formData.discountPercent}
            onChange={(v) => updateField('discountPercent', parseFloat(v.toString()))} // jamais appelé car champ désactivé
            helpText="Réduction familiale appliquée"
            disabled
          />
        </div>
      </GenericForm>
    </div>
  );
}