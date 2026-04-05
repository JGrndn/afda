'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DataTable, Column } from '@/components/ui';
import { PAYMENT_FILTER_STATUS, PaymentFilterStatus } from '@/lib/domain/enums/paymentFilter.enum';

export interface FamilyPaymentRow extends Record<string, unknown> {
  id: number;
  name: string;
  totalDu: number;
  totalEncaisse: number;
  solde: number;
  membresCount: number;
}

export interface ClientInvoiceRow {
  amount: number;
  invoiceNumber: string;
  quoteTitle: string;
}

export interface ClientPaymentRow extends Record<string, unknown> {
  id: number;
  clientName: string;
  invoices: ClientInvoiceRow[];
  totalAmount: number;
}

interface Props {
  status: PaymentFilterStatus;
  activeSeason: { startYear: number; endYear: number } | null;
  families: FamilyPaymentRow[];
  clients: ClientPaymentRow[];
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TabButton({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-white shadow-sm text-gray-900'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}

export function PaymentStatusPageClient({
  status,
  activeSeason,
  families,
  clients,
}: Props) {
  const router = useRouter();
  const isNotPaid = status === PAYMENT_FILTER_STATUS.NOT_PAID;

  const badgeClass = isNotPaid
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-green-50 text-green-700 border-green-200';

  const totalFamiliesSolde = families.reduce((s, f) => s + f.solde, 0);
  const totalClientsSolde = clients.reduce((s, c) => s + c.totalAmount, 0);

  const familyColumns: Column<FamilyPaymentRow>[] = [
    {
      type: 'computed',
      label: 'Famille',
      render: (f) => (
        <div>
          <div className="font-medium text-gray-800">{f.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {f.membresCount} membre{f.membresCount > 1 ? 's' : ''}
          </div>
        </div>
      ),
    },
    {
      type: 'field',
      key: 'totalDu',
      label: 'Facturé',
      render: (f) => (
        <span className="tabular-nums">{fmt(f.totalDu)} €</span>
      ),
    },
    {
      type: 'computed',
      label: 'Encaissé',
      render: (f) => {
        const pct =
          f.totalDu > 0
            ? Math.min(Math.round((f.totalEncaisse / f.totalDu) * 100), 100)
            : 100;
        return (
          <div className="flex flex-col gap-1">
            <span className="tabular-nums text-sm">{fmt(f.totalEncaisse)} €</span>
            <div className="w-20 bg-gray-100 rounded-full h-1">
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isNotPaid ? '#ef4444' : '#10b981',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      type: 'field',
      key: 'solde',
      label: isNotPaid ? 'Reste dû' : 'Solde',
      render: (f) => (
        <span
          className={`font-bold tabular-nums ${
            f.solde > 0 ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {f.solde > 0 ? '+' : ''}{fmt(f.solde)} €
        </span>
      ),
    },
  ];

  const clientColumns: Column<ClientPaymentRow>[] = [
    {
      type: 'field',
      key: 'clientName',
      label: 'Client',
      render: (c) => (
        <span className="font-medium text-gray-800">{c.clientName}</span>
      ),
    },
    {
      type: 'computed',
      label: 'Factures',
      render: (c) => (
        <div className="space-y-1">
          {c.invoices.map((inv, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">{inv.invoiceNumber}</span>
              <span className="text-xs text-gray-500 truncate max-w-xs">{inv.quoteTitle}</span>
              <span className="text-xs font-semibold text-gray-700 tabular-nums ml-2">
                {fmt(inv.amount)} €
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      type: 'field',
      key: 'totalAmount',
      label: 'Montant total',
      render: (c) => (
        <span
          className={`font-bold tabular-nums ${
            isNotPaid ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {fmt(c.totalAmount)} €
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Tableau de bord
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isNotPaid ? 'Paiements en retard' : 'Paiements à jour'}
            </h1>
            {activeSeason && (
              <p className="text-gray-600 mt-1">
                Saison {activeSeason.startYear}–{activeSeason.endYear}
              </p>
            )}
          </div>

          {/* Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            <TabButton href={`?status=${PAYMENT_FILTER_STATUS.NOT_PAID}`} active={isNotPaid}>
              🔴 En retard
            </TabButton>
            <TabButton href={`?status=${PAYMENT_FILTER_STATUS.PAID}`} active={!isNotPaid}>
              🟢 À jour
            </TabButton>
          </div>
        </div>
      </div>

      {/* Familles */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Familles</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>
              {families.length}
            </span>
          </div>
          {families.length > 0 && (
            <span className="text-sm text-gray-500">
              {isNotPaid ? 'Total restant dû' : 'Total encaissé'} :{' '}
              <span className={`font-semibold ${isNotPaid ? 'text-red-600' : 'text-green-600'}`}>
                {fmt(Math.abs(totalFamiliesSolde))} €
              </span>
            </span>
          )}
        </div>

        <DataTable<FamilyPaymentRow>
          data={families}
          columns={familyColumns}
          onRowClick={(f) => router.push(`/families/${f.id}`)}
          emptyMessage={
            isNotPaid
              ? 'Toutes les familles sont à jour de leurs paiements.'
              : "Aucune famille n'a soldé son compte cette saison."
          }
        />
      </div>

      {/* Clients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Clients — Prestations</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>
              {clients.length}
            </span>
          </div>
          {clients.length > 0 && (
            <span className="text-sm text-gray-500">
              {isNotPaid ? 'En attente' : 'Encaissé'} :{' '}
              <span className={`font-semibold ${isNotPaid ? 'text-red-600' : 'text-green-600'}`}>
                {fmt(totalClientsSolde)} €
              </span>
            </span>
          )}
        </div>

        <DataTable<ClientPaymentRow>
          data={clients}
          columns={clientColumns}
          onRowClick={(c) => router.push(`/clients/${c.id}`)}
          emptyMessage={
            isNotPaid
              ? 'Aucune facture de prestation en attente.'
              : 'Aucune facture de prestation payée cette saison.'
          }
        />
      </div>
    </div>
  );
}