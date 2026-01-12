'use client';

import { useState } from 'react';
import { GenericForm, FormField } from '@/components/ui';
import { PAYMENT_TYPE } from '@/lib/domain/enums/payment.enum';
import type { CreatePaymentInput } from '@/lib/schemas/payment.input';

interface PaymentFormProps {
  initialData?: Partial<CreatePaymentInput>;
  onSubmit: (data: CreatePaymentInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  familyId?: number;
  seasonId?: number;
}

export function PaymentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  familyId,
  seasonId,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<CreatePaymentInput>({
    familyId: familyId || 0,
    seasonId: seasonId || 0,
    amount: 0,
    paymentType: PAYMENT_TYPE.TRANSFER,
    cashingDate: null,
    reference: null,
    notes: null,
    ...initialData,
  });

  function updateField<K extends keyof CreatePaymentInput>(
    field: K,
    value: CreatePaymentInput[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const paymentTypeOptions = [
    { value: PAYMENT_TYPE.TRANSFER, label: 'Virement' },
    { value: PAYMENT_TYPE.CHECK, label: 'Chèque' },
    { value: PAYMENT_TYPE.CASH, label: 'Espèces' },
    { value: PAYMENT_TYPE.CARD, label: 'Carte bancaire' },
  ];

  return (
    <GenericForm
      title={initialData ? 'Modifier Paiement' : 'Nouveau Paiement'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Montant (€)"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={(v) => updateField('amount', parseFloat(v.toString()))}
          required
        />

        <FormField
          label="Type de paiement"
          name="paymentType"
          type="select"
          value={formData.paymentType}
          onChange={(v) => updateField('paymentType', v)}
          options={paymentTypeOptions}
          required
        />

        <FormField
          label="Date de paiement"
          name="paymentDate"
          type="date"
          value={
            formData.paymentDate
              ? new Date(formData.paymentDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]
          }
          onChange={(v) => updateField('paymentDate', v ? new Date(v) : undefined)}
        />

        {formData.paymentType === PAYMENT_TYPE.CHECK && (
          <FormField
            label="Date d'encaissement"
            name="cashingDate"
            type="date"
            value={
              formData.cashingDate
                ? new Date(formData.cashingDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
            }
            onChange={(v) => updateField('cashingDate', v ? new Date(v) : null)}
            helpText="Date prévue d'encaissement du chèque"
          />
        )}

        <FormField
          label="Référence"
          name="reference"
          type="text"
          value={formData.reference || ''}
          onChange={(v) => updateField('reference', v || null)}
          placeholder="N° chèque, transaction..."
        />

        <div className="md:col-span-2">
          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes || ''}
            onChange={(v) => updateField('notes', v || null)}
          />
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Le statut du paiement sera déterminé automatiquement :
        </p>
        <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
          <li>Espèces, Virement, Carte → Encaissé immédiatement</li>
          <li>Chèque avec date d'encaissement future → En attente jusqu'à cette date</li>
          <li>Chèque avec date d'encaissement passée → Encaissé automatiquement</li>
        </ul>
      </div>
    </GenericForm>
  );
}