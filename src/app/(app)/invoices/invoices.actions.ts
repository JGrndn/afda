'use server';

import { InvoiceDTO } from '@/lib/dto/invoice.dto';
import { buildInvoiceForFamily } from '@/lib/domain/invoice/buildInvoiceForFamily';
import { invoiceService } from '@/lib/services/invoice.service';

function generateInvoiceNumber(familyId: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${year}${month}-${familyId}`;
}

export async function issueInvoice(
  familyId: number,
  seasonId: number
): Promise<InvoiceDTO> {
  // If already issued, return the existing one
  const existing = await invoiceService.findByFamilyAndSeason(familyId, seasonId);
  if (existing && existing.status !== 'draft') {
    return existing;
  }

  // Build from the draft — source of truth with itemsByMember structure
  const draft = await buildInvoiceForFamily(familyId, seasonId);

  // Flatten items, preserving memberName as a dedicated field
  const items = draft.itemsByMember.flatMap((member) =>
    member.items.map((item) => ({
      memberName: member.memberName,
      label: item.label,
      description: item.description ?? undefined,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent ?? 0,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }))
  );

  const invoiceNumber = generateInvoiceNumber(familyId);

  return invoiceService.createIssuedInvoice({
    familyId,
    seasonId,
    invoiceNumber,
    totalAmount: draft.totalAmount,
    items,
  });
}