import type {
  Client as PrismaClient,
  Quote as PrismaQuote,
  QuoteInvoice as PrismaQuoteInvoice,
} from '@/generated/prisma/client';
import type { ClientDTO, ClientWithQuotesDTO, ClientQuoteSummaryDTO } from '@/lib/dto/client.dto';
import { QuoteInvoiceStatusSchema } from '@/lib/schemas/quoteInvoice.schema';

export function toClientDTO(client: PrismaClient): ClientDTO {
  return {
    id: client.id,
    name: client.name,
    address: client.address,
    phone: client.phone,
    email: client.email,
    contact: client.contact,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}

export function toClientsDTO(clients: PrismaClient[]): ClientDTO[] {
  return clients.map(toClientDTO);
}

export function toClientQuoteSummaryDTO(
  quote: PrismaQuote & { quoteInvoice: Pick<PrismaQuoteInvoice, 'status' | 'paidAt'> | null }
): ClientQuoteSummaryDTO {
  return {
    id: quote.id,
    title: quote.title,
    status: quote.status,
    quoteNumber: quote.quoteNumber,
    totalAmount: (quote.totalAmount as any).toNumber?.() ?? Number(quote.totalAmount),
    issuedAt: quote.issuedAt,
    validUntil: quote.validUntil,
    invoiceStatus: quote.quoteInvoice
      ? QuoteInvoiceStatusSchema.parse(quote.quoteInvoice.status)
      : null,
    invoicePaidAt: quote.quoteInvoice?.paidAt ?? null,
  };
}

export function toClientWithQuotesDTO(
  client: PrismaClient & {
    quotes: (PrismaQuote & {
      quoteInvoice: Pick<PrismaQuoteInvoice, 'status' | 'paidAt'> | null;
    })[];
  }
): ClientWithQuotesDTO {
  return {
    ...toClientDTO(client),
    quotes: client.quotes.map(toClientQuoteSummaryDTO),
  };
}