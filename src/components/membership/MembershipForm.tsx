'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { useMembers } from '@/hooks/member.hook';
import { useSeasons } from '@/hooks/season.hook';
import { MEMBERSHIP_STATUS } from '@/lib/domain/membership.status';
import type { CreateMembershipInput } from '@/lib/schemas/membership.input';

interface MembershipFormProps {
  initialData?: Partial<CreateMembershipInput>;
  onSubmit: (data: CreateMembershipInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  memberId?: number;
  seasonId?: number;
}

export function MembershipForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  memberId,
  seasonId,
}: MembershipFormProps) {
  const { data: members } = useMembers();
  const { data: seasons } = useSeasons();

  const [formData, setFormData] = useState<CreateMembershipInput>({
    memberId: memberId || 0,
    seasonId: seasonId || 0,
    familyOrder: 1,
    amount: 0,
    status: MEMBERSHIP_STATUS.PENDING,
    ...initialData,
  });

  function updateField<K extends keyof CreateMembershipInput>(
    field: K,
    value: CreateMembershipInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const memberOptions =
    members?.map((m) => ({
      value: m.id,
      label: `${m.firstName} ${m.lastName}`,
    })) || [];

  const seasonOptions =
    seasons?.map((s) => ({
      value: s.id,
      label: `${s.startYear}-${s.endYear}`,
    })) || [];

  const statusOptions = [
    { value: MEMBERSHIP_STATUS.PENDING, label: 'En attente' },
    { value: MEMBERSHIP_STATUS.PAID, label: 'Payé' },
    { value: MEMBERSHIP_STATUS.CANCELLED, label: 'Annulé' },
  ];

  return (
    <GenericForm
      title={initialData ? 'Modifier Adhésion' : 'Nouvelle Adhésion'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Membre"
          name="memberId"
          type="select"
          value={formData.memberId}
          onChange={(v) => updateField('memberId', parseInt(v))}
          options={memberOptions}
          required
          disabled={!!memberId}
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
          label="Montant (€)"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={(v) => updateField('amount', parseFloat(v.toString()))}
          required
        />

        <FormField
          label="Ordre familial"
          name="familyOrder"
          type="number"
          value={formData.familyOrder}
          onChange={(v) => updateField('familyOrder', parseInt(v.toString()))}
          required
          helpText="1 = premier membre de la famille, 2 = deuxième, etc."
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
      </div>
    </GenericForm>
  );
}