'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button, ErrorMessage } from '@/components/ui';
import { usePaymentActions } from '@/hooks/payment.hook';
import { PaymentDTO } from '@/lib/dto/payment.dto';
import { Calendar, CreditCard } from 'lucide-react';

interface CashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentDTO;
  onSuccess?: () => void;
}

export function CashPaymentModal({
  isOpen,
  onClose,
  payment,
  onSuccess,
}: CashPaymentModalProps) {
  const { update, isLoading, error } = usePaymentActions();
  
  // Date par défaut : aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [cashingDate, setCashingDate] = useState(today);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await update(payment.id, {
      cashingDate: new Date(cashingDate),
    });

    if (result) {
      onSuccess?.();
      onClose();
      // Réinitialiser pour la prochaine fois
      setCashingDate(today);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Encaisser le paiement"
      size="md"
    >
      {error && (
        <div className="mb-4">
          <ErrorMessage error={error} />
        </div>
      )}

      {/* Récapitulatif du paiement */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Montant</span>
          <span className="text-lg font-bold text-gray-900">
            {payment.amount.toFixed(2)} €
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Méthode</span>
          {payment.paymentType}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Date de paiement</span>
          <span className="text-sm text-gray-900">
            {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {payment.notes && (
          <div className="pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Notes :</span>
            <p className="text-sm text-gray-900 mt-1">{payment.notes}</p>
          </div>
        )}
      </div>

      {/* Formulaire d'encaissement */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="cashingDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date d'encaissement
            </div>
          </label>
          <input
            id="cashingDate"
            type="date"
            value={cashingDate}
            onChange={(e) => setCashingDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
          
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            className="flex-1"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Encaisser
          </Button>
        </div>
      </div>
    </Modal>
  );
}