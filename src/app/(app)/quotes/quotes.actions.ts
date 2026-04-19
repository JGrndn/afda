'use server';

import { QuoteStatus } from '@/lib/domain/enums/quote.enum';
import { QuoteDTO, QuoteInvoiceDTO } from '@/lib/dto/quote.dto';
import {
  CreateQuoteInput,
  CreateQuoteSchema,
  UpdateQuoteInput,
  UpdateQuoteSchema,
} from '@/lib/schemas/quote.input';
import {
  MarkInvoicePaidInput,
  MarkInvoicePaidSchema,
} from '@/lib/schemas/quoteInvoice.schema';
import { quoteService } from '@/lib/services/quote.service';

export async function createQuote(input: CreateQuoteInput): Promise<QuoteDTO> {
  const data = CreateQuoteSchema.parse(input);
  return quoteService.create(data);
}

export async function updateQuote(id: number, input: UpdateQuoteInput): Promise<QuoteDTO> {
  const data = UpdateQuoteSchema.parse(input);
  return quoteService.update(id, data);
}

export async function updateQuoteStatus(id: number, status: QuoteStatus): Promise<QuoteDTO> {
  return quoteService.updateStatus(id, status);
}

export async function deleteQuote(id: number): Promise<void> {
  return quoteService.delete(id);
}

export async function issueQuoteInvoice(quoteId: number): Promise<QuoteInvoiceDTO> {
  return quoteService.issueInvoice(quoteId);
}

export async function markQuoteInvoicePaid(
  quoteInvoiceId: number,
  input: MarkInvoicePaidInput
): Promise<QuoteInvoiceDTO> {
  const data = MarkInvoicePaidSchema.parse(input);
  return quoteService.markInvoicePaid(quoteInvoiceId, data);
}

export async function cancelQuoteInvoice(quoteInvoiceId: number): Promise<QuoteInvoiceDTO> {
  return quoteService.cancelInvoice(quoteInvoiceId);
}