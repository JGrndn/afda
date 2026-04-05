import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { seasonService } from '@/lib/services/season.service';
import { familyService } from '@/lib/services/family.service';
import { memberService } from '@/lib/services/member.service';
import { membershipService } from '@/lib/services/membership.service';
import { registrationService } from '@/lib/services/registration.service';
import { paymentService } from '@/lib/services/payment.service';
import { quoteService } from '@/lib/services/quote.service';
import { computeFinancialStats } from '@/lib/domain/finance';
import { PaymentStatusPageClient } from './PaymentStatusPageClient';
import type { FamilyPaymentRow, ClientPaymentRow } from './PaymentStatusPageClient';
import type { PaymentDTO } from '@/lib/dto/payment.dto';

type Status = 'not-paid' | 'paid';

async function getPageData(status: Status) {
  const seasons = await seasonService.getAll({ filters: { status: 'active' } });
  const activeSeason = seasons[0] ?? null;
  if (!activeSeason) return { activeSeason: null, families: [], clients: [] };

  const seasonId = activeSeason.id;

  // --- Familles ---
  const allFamilies = await familyService.getAll();

  const familyRows: FamilyPaymentRow[] = [];

  await Promise.all(
    allFamilies.map(async (family) => {
      const members = await memberService.getAll({ familyId: family.id });
      const memberIds = members.map((m) => m.id);

      if (memberIds.length === 0) return;

      const [memberships, registrations, payments] = await Promise.all([
        membershipService.getAll({ memberIds, seasonId }),
        registrationService.getAll({ memberIds, seasonId }),
        paymentService.getAll({ familyId: family.id, seasonId }) as Promise<PaymentDTO[]>,
      ]);

      // Ignorer les familles sans adhésion cette saison
      if (memberships.length === 0) return;

      const stats = computeFinancialStats(
        [{ memberships, registrations }],
        payments,
        seasonId
      );

      const isAJour = stats.balance <= 0;

      if (
        (status === 'not-paid' && !isAJour) ||
        (status === 'paid' && isAJour)
      ) {
        familyRows.push({
          id: family.id,
          name: family.name,
          totalDu: stats.totalDue,
          totalEncaisse: stats.totalPaid,
          solde: stats.balance,
          membresCount: members.length,
        });
      }
    })
  );

  familyRows.sort((a, b) => b.solde - a.solde);

  // --- Clients / QuoteInvoice ---
  const quoteInvoiceStatus = status === 'not-paid' ? 'issued' : 'paid';
  const allQuotes = await quoteService.getAll();

  // On récupère les détails de chaque quote pour accéder aux invoices
  const clientMap: Record<
    number,
    { clientName: string; invoices: { amount: number; invoiceNumber: string; quoteTitle: string }[] }
  > = {};

  await Promise.all(
    allQuotes.map(async (q) => {
      const detail = await quoteService.getById(q.id);
      if (!detail?.invoice) return;
      if (detail.invoice.seasonId !== seasonId) return;
      if (detail.invoice.status !== quoteInvoiceStatus) return;

      if (!clientMap[q.clientId]) {
        clientMap[q.clientId] = { clientName: q.clientName, invoices: [] };
      }
      clientMap[q.clientId].invoices.push({
        amount: detail.invoice.totalAmount,
        invoiceNumber: detail.invoice.invoiceNumber ?? '',
        quoteTitle: q.title,
      });
    })
  );

  const clientRows: ClientPaymentRow[] = Object.entries(clientMap).map(
    ([id, data]) => ({
      id: Number(id),
      clientName: data.clientName,
      invoices: data.invoices,
      totalAmount: data.invoices.reduce((s, i) => s + i.amount, 0),
    })
  );

  clientRows.sort((a, b) => b.totalAmount - a.totalAmount);

  return { activeSeason, families: familyRows, clients: clientRows };
}

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const { status: rawStatus } = await searchParams;
  const status: Status =
    rawStatus === 'paid' ? 'paid' : 'not-paid';

  const data = await getPageData(status);

  return (
    <PaymentStatusPageClient
      status={status}
      activeSeason={data.activeSeason}
      families={data.families}
      clients={data.clients}
    />
  );
}