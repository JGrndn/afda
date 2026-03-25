'use server';

import { InvoiceDTO } from '@/lib/dto/invoice.dto';
import { buildInvoiceForFamily } from '@/lib/domain/invoice/buildInvoiceForFamily';
import { invoiceService } from '@/lib/services/invoice.service';

let invoiceCounter = 0;

function generateInvoiceNumber(familyId: number, seasonId: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `AFDA-${year}${month}-${familyId}-${random}`;
}

export async function issueInvoice(
  familyId: number,
  seasonId: number
): Promise<InvoiceDTO> {
  // Check if already issued
  const existing = await invoiceService.findByFamilyAndSeason(familyId, seasonId);
  if (existing && existing.status !== 'draft') {
    return existing;
  }

  // Build the invoice data
  const draft = await buildInvoiceForFamily(familyId, seasonId);

  // Flatten items from all members
  const items = draft.itemsByMember.flatMap((member) =>
    member.items.map((item) => ({
      label: `${member.memberName} — ${item.label}`,
      description: item.description ?? undefined,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }))
  );

  const invoiceNumber = generateInvoiceNumber(familyId, seasonId);

  const issued = await invoiceService.createIssuedInvoice({
    familyId,
    seasonId,
    invoiceNumber,
    totalAmount: draft.totalAmount,
    items,
  });

  return issued;
}