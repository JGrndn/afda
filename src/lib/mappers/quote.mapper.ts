import type {
  Quote as PrismaQuote,
  QuoteItem as PrismaQuoteItem,
  QuoteInvoice as PrismaQuoteInvoice,
} from '@/generated/prisma/client';
import type {
  QuoteDTO,
  QuoteItemDTO,
  QuoteWithDetailsDTO,
  QuoteWithClientDTO,
  QuoteInvoiceDTO,
} from '@/lib/dto/quote.dto';
import { QuoteStatusSchema } from '@/lib/schemas/quote.schema';

function dec(v: any): number {
  return v?.toNumber?.() ?? Number(v);
}

export function toQuoteItemDTO(item: PrismaQuoteItem): QuoteItemDTO {
  return {
    id: item.id,
    quoteId: item.quoteId,
    label: item.label,
    description: item.description,
    unitPrice: dec(item.unitPrice),
    quantity: item.quantity,
    lineTotal: dec(item.lineTotal),
  };
}

export function toQuoteInvoiceDTO(invoice: PrismaQuoteInvoice): QuoteInvoiceDTO {
  return {
    id: invoice.id,
    quoteId: invoice.quoteId,
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    totalAmount: dec(invoice.totalAmount),
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

export function toQuoteDTO(quote: PrismaQuote): QuoteDTO {
  return {
    id: quote.id,
    clientId: quote.clientId,
    title: quote.title,
    description: quote.description,
    status: QuoteStatusSchema.parse(quote.status),
    quoteNumber: quote.quoteNumber,
    issuedAt: quote.issuedAt,
    validUntil: quote.validUntil,
    totalAmount: dec(quote.totalAmount),
    notes: quote.notes,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
  };
}

export function toQuotesDTO(quotes: PrismaQuote[]): QuoteDTO[] {
  return quotes.map(toQuoteDTO);
}

export function toQuoteWithClientDTO(
  quote: PrismaQuote & { client: { name: string } }
): QuoteWithClientDTO {
  return {
    ...toQuoteDTO(quote),
    clientName: quote.client.name,
  };
}

export function toQuoteWithDetailsDTO(
  quote: PrismaQuote & {
    client: { name: string };
    items: PrismaQuoteItem[];
    quoteInvoice: PrismaQuoteInvoice | null;
  }
): QuoteWithDetailsDTO {
  return {
    ...toQuoteDTO(quote),
    clientName: quote.client.name,
    items: quote.items.map(toQuoteItemDTO),
    invoice: quote.quoteInvoice ? toQuoteInvoiceDTO(quote.quoteInvoice) : null,
  };
}