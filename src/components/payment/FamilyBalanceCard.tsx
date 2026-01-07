'use client';

import { Card } from '@/components/ui';
import { FamilyFinancialStats } from '@/lib/domain/finance';

interface FamilyBalanceCardProps {
  financialStats : FamilyFinancialStats
  className?: string;
}

export function FamilyBalanceCard({ 
  financialStats,
  className = '' 
}: FamilyBalanceCardProps) {
  return (
    <Card title='Situation financière'>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-blue-600">Montant total dû</dt>
            <dd className="mt-1 text-2xl font-bold text-blue-900">
              {financialStats.totalDue.toFixed(2)} €
            </dd>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-green-600">Montant payé</dt>
            <dd className="mt-1 text-2xl font-bold text-green-900">
              {financialStats.totalPaid.toFixed(2)} €
            </dd>
          </div>

          <div
            className={`p-4 rounded-lg ${
              financialStats.balance > 0
                ? 'bg-red-50'
                : financialStats.balance < 0
                ? 'bg-yellow-50'
                : 'bg-gray-50'
            }`}
          >
            <dt
              className={`text-sm font-medium ${
                financialStats.balance > 0
                  ? 'text-red-600'
                  : financialStats.balance < 0
                  ? 'text-yellow-600'
                  : 'text-gray-600'
              }`}
            >
              Solde restant
            </dt>
            <dd
              className={`mt-1 text-2xl font-bold ${
                financialStats.balance > 0
                  ? 'text-red-900'
                  : financialStats.balance < 0
                  ? 'text-yellow-900'
                  : 'text-gray-900'
              }`}
            >
              {financialStats.balance.toFixed(2)} €
            </dd>
          </div>
        </div>

      </div>
    </Card>
  );
}