'use client';

import { Card } from '@/components/ui';
import { useFamilyBalance } from '@/hooks/payment.hook';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface FamilyBalanceCardProps {
  familyId: number;
  seasonId: number;
}

export function FamilyBalanceCard({ familyId, seasonId }: FamilyBalanceCardProps) {
  const { balance, isLoading } = useFamilyBalance(familyId, seasonId);

  if (isLoading) {
    return (
      <Card title="Situation financière">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  const statusIcon = balance.isFullyPaid ? (
    <CheckCircle className="w-6 h-6 text-green-600" />
  ) : balance.balance > 0 ? (
    <XCircle className="w-6 h-6 text-red-600" />
  ) : (
    <Clock className="w-6 h-6 text-yellow-600" />
  );

  const statusText = balance.isFullyPaid
    ? 'Solde payé'
    : balance.balance > 0
    ? 'Paiement incomplet'
    : 'En attente de paiement';

  const statusColor = balance.isFullyPaid
    ? 'text-green-600'
    : balance.balance > 0
    ? 'text-red-600'
    : 'text-yellow-600';

  return (
    <Card title={`Situation financière - ${balance.seasonYear}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {statusIcon}
          <span className={`text-lg font-semibold ${statusColor}`}>{statusText}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-blue-600">Montant total dû</dt>
            <dd className="mt-1 text-2xl font-bold text-blue-900">
              {balance.totalDue.toFixed(2)} €
            </dd>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-green-600">Montant payé</dt>
            <dd className="mt-1 text-2xl font-bold text-green-900">
              {balance.totalPaid.toFixed(2)} €
            </dd>
          </div>

          <div
            className={`p-4 rounded-lg ${
              balance.balance > 0
                ? 'bg-red-50'
                : balance.balance < 0
                ? 'bg-yellow-50'
                : 'bg-gray-50'
            }`}
          >
            <dt
              className={`text-sm font-medium ${
                balance.balance > 0
                  ? 'text-red-600'
                  : balance.balance < 0
                  ? 'text-yellow-600'
                  : 'text-gray-600'
              }`}
            >
              Solde restant
            </dt>
            <dd
              className={`mt-1 text-2xl font-bold ${
                balance.balance > 0
                  ? 'text-red-900'
                  : balance.balance < 0
                  ? 'text-yellow-900'
                  : 'text-gray-900'
              }`}
            >
              {balance.balance.toFixed(2)} €
            </dd>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            {balance.paymentsCount} paiement{balance.paymentsCount > 1 ? 's' : ''} enregistré
            {balance.paymentsCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Card>
  );
}