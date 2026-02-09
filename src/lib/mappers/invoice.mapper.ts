import type { InvoiceItem as PrismaInvoiceItem, Invoice as PrismaInvoice } from '@/generated/prisma/client';
import { InvoiceDTO, InvoiceItemDTO } from "@/lib/dto/invoice.dto";
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
export function mapDraftInvoiceItemToDTO(item: DraftInvoiceItem): InvoiceItemDTO{
  return {
    label: item.label,
    description: item.description,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  };
}

export function mapInvoiceToDTO(
  invoice: PrismaInvoiceDetails
): InvoiceDTO {
  return {
    familyId: invoice.familyId,
    seasonId: invoice.seasonId,
    status: invoice.status as InvoiceDTO['status'],
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    totalAmount: invoice.totalAmount.toNumber(),
    items: invoice.items ? invoice.items.map(mapInvoiceItemToDTO) : [],
  };
}