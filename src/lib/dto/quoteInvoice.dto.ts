import { QuoteInvoiceDTO } from '@/lib/dto/quote.dto';

export type QuoteInvoiceWithDetailsDTO = QuoteInvoiceDTO & {
  quoteTitle: string;
  quoteNumber: string | null;
  clientName: string;
  seasonYear: string | null;
};