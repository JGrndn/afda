import { InvoiceDTO, InvoiceItemDTO } from '@/lib/dto/invoice.dto';
import {
  memberService,
  membershipService,
  registrationService,
} from '@/lib/services';

export async function buildInvoiceForFamily(
  familyId: number,
  seasonId: number
): Promise<InvoiceDTO> {
  const members = await memberService.getAll({ familyId });
  const memberIds = members.map((m) => m.id);

  const memberships = await membershipService.getAll({ memberIds, seasonId });
  const registrations = await registrationService.getAll({ memberIds, seasonId });

  const items: InvoiceItemDTO[] = [];

  for (const m of memberships) {
    items.push({
      label: 'Adhésion',
      unitPrice: m.amount,
      quantity: 1,
      lineTotal: m.amount,
    });
  }

  for (const r of registrations) {
    items.push({
      label: 'Inscription',
      unitPrice: r.totalPrice,
      quantity: r.quantity,
      lineTotal: r.totalPrice,
    });
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  return {
    id: null,
    familyId,
    seasonId,
    status: 'draft',
    invoiceNumber: null,
    issuedAt: null,
    items,
    totalAmount,
  };
}