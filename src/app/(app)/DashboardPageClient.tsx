'use client';

export interface WorkshopStat {
  workshopName: string;
  memberCount: number;
  amountDue: number;
}

export interface DashboardData {
  activeSeason: {
    id: number;
    startYear: number;
    endYear: number;
    membershipAmount: number;
    discountPercent: number;
  } | null;
  stats: {
    members: number;
    families: number;
    workshopStats: WorkshopStat[];
    membershipAmountDue: number;
    workshopAmountDue: number;
    totalDu: number;
    totalEncaisse: number;
    totalEnAttente: number;
    resteARecevoir: number;
    donationTotal: number;
    quoteInvoicePaidAmount: number;
    quoteInvoicePaidCount: number;
    quoteInvoiceIssuedAmount: number;
    quoteInvoiceIssuedCount: number;
  } | null;
}

interface Props {
  data: DashboardData;
  userName?: string | null;
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  highlight?: 'warning' | 'success' | 'neutral';
}) {
  const highlightClass =
    highlight === 'warning'
      ? 'bg-red-50'
      : highlight === 'success'
      ? 'bg-green-50'
      : 'bg-white';

  return (
    <div
      style={{ borderLeftColor: accent }}
      className={`${highlightClass} rounded-lg p-5 border-l-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SourceCard({
  label,
  amountDue,
  sub,
  emoji,
  color,
}: {
  label: string;
  amountDue: number;
  sub: string;
  emoji: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5`} style={{ color }}>
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900">{fmt(amountDue)} €</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}18` }}
        >
          {emoji}
        </div>
      </div>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 mt-8 flex items-center gap-2">
      <span className="inline-block w-4 h-px bg-gray-300" />
      {children}
      <span className="flex-1 h-px bg-gray-100" />
    </h2>
  );
}

export function DashboardPageClient({ data, userName }: Props) {
  const { activeSeason, stats } = data;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  })();

  if (!activeSeason || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🎭</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Aucune saison active</h2>
          <p className="text-gray-400 text-sm">
            Créez et activez une saison pour voir le tableau de bord.
          </p>
        </div>
      </div>
    );
  }

  const encaissePct =
    stats.totalDu > 0 ? Math.min(Math.round((stats.totalEncaisse / stats.totalDu) * 100), 100) : 0;

  const maxWorkshopDue = Math.max(...stats.workshopStats.map((w) => w.amountDue), 1);
  const maxWorkshopCount = Math.max(...stats.workshopStats.map((w) => w.memberCount), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-0.5">
              {greeting}
              {userName ? `, ${userName}` : ''} —
            </p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Tableau de bord
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Saison {activeSeason.startYear}–{activeSeason.endYear} active
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* KPIs financiers — base homogène "montants dus" */}
        <SectionTitle>Situation financière</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Total facturé"
            value={`${fmt(stats.totalDu)} €`}
            sub="Adhésions + ateliers + prestations"
            accent="#6366f1"
            highlight="neutral"
          />
          <KpiCard
            label="Encaissé"
            value={`${fmt(stats.totalEncaisse)} €`}
            sub={`${encaissePct}% du total facturé`}
            accent="#10b981"
            highlight="success"
          />
          <KpiCard
            label="Reste à recevoir"
            value={`${fmt(stats.resteARecevoir)} €`}
            sub={
              stats.totalEnAttente > 0
                ? `dont ${fmt(stats.totalEnAttente)} € en attente d'encaissement`
                : 'Aucun paiement en attente'
            }
            accent={stats.resteARecevoir > 0 ? '#ef4444' : '#10b981'}
            highlight={stats.resteARecevoir > 0 ? 'warning' : 'success'}
          />
          <KpiCard
            label="Dons reçus"
            value={`${fmt(stats.donationTotal)} €`}
            sub="Sur les paiements encaissés"
            accent="#f59e0b"
            highlight="neutral"
          />
        </div>

        {/* Barre de progression globale */}
        <div className="mt-4 bg-white rounded-lg px-5 py-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500">
              Taux d'encaissement global
            </span>
            <span className="text-sm font-bold text-gray-800">{encaissePct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                encaissePct === 100 ? 'bg-green-500' : encaissePct >= 75 ? 'bg-blue-500' : 'bg-amber-400'
              }`}
              style={{ width: `${encaissePct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
            <span>{fmt(stats.totalEncaisse)} € encaissés</span>
            <span>{fmt(stats.totalDu)} € facturés</span>
          </div>
        </div>

        {/* Membres */}
        <SectionTitle>Participation</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard
            label="Membres inscrits"
            value={stats.members.toString()}
            sub={`${stats.families} famille${stats.families > 1 ? 's' : ''}`}
            accent="#3b82f6"
            highlight="neutral"
          />
          <KpiCard
            label="Inscriptions ateliers"
            value={stats.workshopStats.reduce((s, w) => s + w.memberCount, 0).toString()}
            sub={`sur ${stats.workshopStats.length} atelier${stats.workshopStats.length > 1 ? 's' : ''}`}
            accent="#8b5cf6"
            highlight="neutral"
          />
        </div>

        {/* Montants facturés par source */}
        <SectionTitle>Montants par source</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SourceCard
            label="Adhésions"
            amountDue={stats.membershipAmountDue}
            emoji="🎫"
            color="#3b82f6"
            sub={`${stats.members} membre${stats.members > 1 ? 's' : ''} · ${activeSeason.membershipAmount} € / pers.${
              activeSeason.discountPercent > 0
                ? ` · −${activeSeason.discountPercent}% à partir du 2ème`
                : ''
            }`}
          />
          <SourceCard
            label="Ateliers"
            amountDue={stats.workshopAmountDue}
            emoji="🎭"
            color="#8b5cf6"
            sub={`${stats.workshopStats.length} atelier${stats.workshopStats.length > 1 ? 's' : ''} · ${stats.workshopStats.reduce((s, w) => s + w.memberCount, 0)} inscription${stats.workshopStats.reduce((s, w) => s + w.memberCount, 0) > 1 ? 's' : ''}`}
          />
          <SourceCard
            label="Prestations"
            amountDue={stats.quoteInvoicePaidAmount + stats.quoteInvoiceIssuedAmount}
            emoji="📋"
            color="#10b981"
            sub={[
              stats.quoteInvoicePaidCount > 0
                ? `${stats.quoteInvoicePaidCount} payée${stats.quoteInvoicePaidCount > 1 ? 's' : ''} (${fmt(stats.quoteInvoicePaidAmount)} €)`
                : null,
              stats.quoteInvoiceIssuedCount > 0
                ? `${stats.quoteInvoiceIssuedCount} en attente (${fmt(stats.quoteInvoiceIssuedAmount)} €)`
                : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Aucune facture'}
          />
        </div>

        {/* Détail ateliers */}
        {stats.workshopStats.length > 0 && (
          <>
            <SectionTitle>Détail par atelier</SectionTitle>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">
                      Atelier
                    </th>
                    <th className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3 w-40">
                      Participants
                    </th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-5 py-3 w-48">
                      Montant facturé
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.workshopStats.map((ws, i) => {
                    const duePct = Math.round((ws.amountDue / maxWorkshopDue) * 100);
                    const cntPct = Math.round((ws.memberCount / maxWorkshopCount) * 100);
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-medium text-gray-800 text-sm">
                            {ws.workshopName}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-400 h-1.5 rounded-full"
                                style={{ width: `${cntPct}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-6 text-right">
                              {ws.memberCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-purple-400 h-1.5 rounded-full"
                                style={{ width: `${duePct}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-800 tabular-nums">
                              {fmt(ws.amountDue)} €
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Total
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                      {stats.workshopStats.reduce((s, w) => s + w.memberCount, 0)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-gray-800 tabular-nums">
                      {fmt(stats.workshopAmountDue)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        <div className="mt-10 text-center text-xs text-gray-300">
          Données calculées en temps réel · Saison {activeSeason.startYear}–{activeSeason.endYear}
        </div>
      </div>
    </div>
  );
}