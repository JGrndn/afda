import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { seasonService } from '@/lib/services/season.service';
import { registrationService } from '@/lib/services/registration.service';
import { membershipService } from '@/lib/services/membership.service';
import { paymentService } from '@/lib/services/payment.service';
import { workshopService } from '@/lib/services/workshop.service';
import { quoteService } from '@/lib/services/quote.service';
import { DashboardPageClient } from './DashboardPageClient';
import type { DashboardData } from './DashboardPageClient';
import { PAYMENT_STATUS } from '@/lib/domain/enums/payment.enum';
import type { PaymentDTO } from '@/lib/dto/payment.dto';

async function getDashboardData(): Promise<DashboardData> {
  const seasons = await seasonService.getAll({ filters: { status: 'active' } });
  const activeSeason = seasons[0] ?? null;

  if (!activeSeason) {
    return { activeSeason: null, stats: null };
  }

  const seasonId = activeSeason.id;

  const [memberships, registrations, allPayments, workshops, quoteInvoiceStats] =
    await Promise.all([
      membershipService.getAll({ seasonId }),
      registrationService.getAll({ seasonId }),
      paymentService.getAll({ seasonId }) as Promise<PaymentDTO[]>,
      workshopService.getAll(),
      quoteService.getInvoiceStatsBySeason(seasonId),
    ]);

  // --- Ateliers ---
  const workshopMap = Object.fromEntries(workshops.map((w) => [w.id, w.name]));

  const workshopAgg: Record<number, { memberCount: number; amountDue: number }> = {};
  for (const reg of registrations) {
    if (!workshopAgg[reg.workshopId]) {
      workshopAgg[reg.workshopId] = { memberCount: 0, amountDue: 0 };
    }
    workshopAgg[reg.workshopId].memberCount += 1;
    workshopAgg[reg.workshopId].amountDue += reg.totalPrice;
  }

  const workshopStats = Object.entries(workshopAgg)
    .map(([id, agg]) => ({
      workshopName: workshopMap[Number(id)] ?? 'Inconnu',
      memberCount: agg.memberCount,
      amountDue: agg.amountDue,
    }))
    .sort((a, b) => b.amountDue - a.amountDue);

  // --- Adhésions ---
  const membershipAmountDue = memberships.reduce((sum, m) => sum + m.amount, 0);
  const memberIds = new Set(memberships.map((m) => m.memberId));
  const familyCount = memberships.filter((m) => m.familyOrder === 1).length;

  // --- Paiements ---
  const completedPayments = allPayments.filter((p) => p.status === PAYMENT_STATUS.COMPLETED);
  const pendingPayments = allPayments.filter((p) => p.status === PAYMENT_STATUS.PENDING);

  const totalEncaisse = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalEnAttente = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const donationTotal = completedPayments.reduce((sum, p) => sum + (p.donationAmount ?? 0), 0);

  // --- Total dû ---
  // Adhésions + Ateliers + Prestations payées (les prestations "issued" sont en attente)
  const workshopAmountDue = workshopStats.reduce((s, w) => s + w.amountDue, 0);
  const totalDu =
    membershipAmountDue +
    workshopAmountDue +
    quoteInvoiceStats.paidAmount +
    quoteInvoiceStats.issuedAmount;

  const resteARecevoir = totalDu - totalEncaisse;

  return {
    activeSeason: {
      id: activeSeason.id,
      startYear: activeSeason.startYear,
      endYear: activeSeason.endYear,
      membershipAmount: activeSeason.membershipAmount,
      discountPercent: activeSeason.discountPercent,
    },
    stats: {
      members: memberIds.size,
      families: familyCount,
      workshopStats,
      membershipAmountDue,
      workshopAmountDue,
      totalDu,
      totalEncaisse,
      totalEnAttente,
      resteARecevoir,
      donationTotal,
      quoteInvoicePaidAmount: quoteInvoiceStats.paidAmount,
      quoteInvoicePaidCount: quoteInvoiceStats.paidCount,
      quoteInvoiceIssuedAmount: quoteInvoiceStats.issuedAmount,
      quoteInvoiceIssuedCount: quoteInvoiceStats.issuedCount,
    },
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  const data = await getDashboardData();

  return <DashboardPageClient data={data} userName={session.user.name} />;
}