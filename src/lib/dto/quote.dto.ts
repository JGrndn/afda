import { QuoteStatus } from '@/lib/domain/enums/quote.enum';

export type QuoteItemDTO = {
  id: number;
  quoteId: number;
  label: string;
  description: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type QuoteDTO = {
  id: number;
  clientId: number;
  title: string;
  description: string | null;
  status: QuoteStatus;
  quoteNumber: string | null;
  issuedAt: Date | null;
  validUntil: Date | null;
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type QuoteWithDetailsDTO = QuoteDTO & {
  clientName: string;
  items: QuoteItemDTO[];
  invoice: QuoteInvoiceDTO | null;
};

export type QuoteWithClientDTO = QuoteDTO & {
  clientName: string;
};

export type QuoteInvoiceDTO = {
  id: number;
  quoteId: number;
  invoiceNumber: string;
  issuedAt: Date;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};