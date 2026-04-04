'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { GenericForm, FormField, Button } from '@/components/ui';
import { useClients } from '@/hooks/client.hook';
import type { CreateQuoteInput, QuoteItemInput } from '@/lib/schemas/quote.input';

interface QuoteFormProps {
  initialData?: Partial<CreateQuoteInput>;
  onSubmit: (data: CreateQuoteInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  /** Pré-sélectionner un client (désactive le champ) */
  clientId?: number;
}

const emptyItem = (): QuoteItemInput => ({
  label: '',
  description: null,
  unitPrice: 0,
  quantity: 1,
  lineTotal: 0,
});

export function QuoteForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  clientId,
}: QuoteFormProps) {
  const { data: clients } = useClients();

  const [formData, setFormData] = useState<Omit<CreateQuoteInput, 'items'>>({
    clientId: clientId ?? initialData?.clientId ?? 0,
    title: initialData?.title ?? '',
    description: initialData?.description ?? null,
    status: initialData?.status ?? 'draft',
    validUntil: initialData?.validUntil ?? null,
    notes: initialData?.notes ?? null,
  });

  const [items, setItems] = useState<QuoteItemInput[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [emptyItem()]
  );

  // ── helpers ──────────────────────────────────────────────
  function updateField<K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateItem(index: number, field: keyof QuoteItemInput, raw: any) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: raw };
      item.lineTotal = item.unitPrice * item.quantity;
      next[index] = item;
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const clientOptions = clients?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, items });
  };

  return (
    <GenericForm
      title={initialData?.title ? 'Modifier le devis' : 'Nouveau devis'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    >
      {/* ── Entête ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField
          label="Client"
          name="clientId"
          type="select"
          value={formData.clientId}
          onChange={(v) => updateField('clientId', parseInt(v))}
          options={clientOptions}
          required
          disabled={!!clientId}
        />

        <FormField
          label="Titre de la prestation"
          name="title"
          type="text"
          value={formData.title}
          onChange={(v) => updateField('title', v)}
          required
          placeholder="Animation théâtre, Atelier improvisation..."
        />

        <FormField
          label="Valable jusqu'au"
          name="validUntil"
          type="date"
          value={
            formData.validUntil
              ? new Date(formData.validUntil).toISOString().split('T')[0]
              : ''
          }
          onChange={(v) => updateField('validUntil', v ? new Date(v) : null)}
        />

        <div className="md:col-span-2">
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description || ''}
            onChange={(v) => updateField('description', v || null)}
            placeholder="Contexte, objectifs de la prestation..."
          />
        </div>
      </div>

      {/* ── Lignes ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Lignes du devis</h3>
          <Button type="button" size="sm" variant="secondary" onClick={addItem} Icon={Plus}>
            Ajouter une ligne
          </Button>
        </div>

        {/* Header colonnes */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-2 mb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span className="col-span-5">Libellé</span>
          <span className="col-span-2 text-right">Prix unit. (€)</span>
          <span className="col-span-2 text-right">Qté</span>
          <span className="col-span-2 text-right">Total (€)</span>
          <span className="col-span-1" />
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 items-start bg-gray-50 rounded-lg p-2"
            >
              <div className="col-span-12 md:col-span-5">
                <FormField
                  name={`label_${i}`}
                  type="text"
                  value={item.label}
                  onChange={(v) => updateItem(i, 'label', v)}
                  required
                  compact
                  placeholder="Libellé..."
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <FormField
                  name={`unitPrice_${i}`}
                  type="number"
                  value={item.unitPrice}
                  onChange={(v) => updateItem(i, 'unitPrice', parseFloat(v) || 0)}
                  required
                  compact
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <FormField
                  name={`quantity_${i}`}
                  type="number"
                  value={item.quantity}
                  onChange={(v) => updateItem(i, 'quantity', parseInt(v) || 1)}
                  required
                  compact
                />
              </div>
              <div className="col-span-3 md:col-span-2 flex items-center justify-end h-8">
                <span className="text-sm font-medium text-gray-900">
                  {(item.unitPrice * item.quantity).toFixed(2)} €
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-center h-8">
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-end mt-3 pr-2">
          <div className="text-right">
            <span className="text-sm text-gray-500 mr-4">Total HT</span>
            <span className="text-lg font-bold text-gray-900">{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <FormField
        label="Notes internes"
        name="notes"
        type="textarea"
        value={formData.notes || ''}
        onChange={(v) => updateField('notes', v || null)}
        placeholder="Remarques, conditions particulières..."
      />
    </GenericForm>
  );
}