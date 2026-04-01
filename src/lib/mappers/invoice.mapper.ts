import type { InvoiceItem as PrismaInvoiceItem } from '@/generated/prisma/client';
import { InvoiceDTO, InvoiceItemDTO, InvoiceItemByMemberDTO } from '@/lib/dto/invoice.dto';
import { PrismaInvoiceDetails } from '@/lib/services/invoice.service';

export function mapInvoiceItemToDTO(item: PrismaInvoiceItem): InvoiceItemDTO {
  return {
    label: item.label,
    description: item.description,
    unitPrice: item.unitPrice.toNumber(),
    quantity: item.quantity,
    lineTotal: item.lineTotal.toNumber(),
  };
}

export interface DraftInvoiceItem {
  label: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export function mapDraftInvoiceItemToDTO(item: DraftInvoiceItem): InvoiceItemDTO {
  return {
    label: item.label,
    description: item.description,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  };
}

/**
 * Reconstructs itemsByMember from persisted InvoiceItems using the
 * memberName column. Insertion order is preserved (Map keeps insertion order).
 * Items without memberName fall into a "Divers" catch-all group.
 */
function rebuildItemsByMember(items: PrismaInvoiceItem[]): InvoiceItemByMemberDTO[] {
  const groups = new Map<string, InvoiceItemByMemberDTO>();
  let syntheticId = 0;

  for (const item of items) {
    const memberName = item.memberName ?? 'Divers';

    if (!groups.has(memberName)) {
      groups.set(memberName, {
        memberId: syntheticId++,
        memberName,
        items: [],
      });
    }

    groups.get(memberName)!.items.push({
      label: item.label,
      description: item.description,
      unitPrice: item.unitPrice.toNumber(),
      discountPercent: item.discountPercent.toNumber(),
      quantity: item.quantity,
      lineTotal: item.lineTotal.toNumber(),
    });
  }

  return Array.from(groups.values());
}

export function mapInvoiceToDTO(invoice: PrismaInvoiceDetails): InvoiceDTO {
  return {
  id: invoice.id,
  familyId: invoice.familyId,
  seasonId: invoice.seasonId,
  season: '',
  status: invoice.status as InvoiceDTO['status'],
  invoiceNumber: invoice.invoiceNumber,
  issuedAt: invoice.issuedAt,
  totalAmount: invoice.totalAmount.toNumber(),
  itemsByMember: invoice.items ? rebuildItemsByMember(invoice.items) : [],
  familyName: '',
};
}