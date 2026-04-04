'use server';

import { QuoteDTO, QuoteInvoiceDTO } from '@/lib/dto/quote.dto';
import {
  CreateQuoteInput,
  CreateQuoteSchema,
  UpdateQuoteInput,
  UpdateQuoteSchema,
} from '@/lib/schemas/quote.input';
import { quoteService } from '@/lib/services/quote.service';

export async function createQuote(input: CreateQuoteInput): Promise<QuoteDTO> {
  const data = CreateQuoteSchema.parse(input);
  return quoteService.create(data);
}

export async function updateQuote(id: number, input: UpdateQuoteInput): Promise<QuoteDTO> {
  const data = UpdateQuoteSchema.parse(input);
  return quoteService.update(id, data);
}

export async function deleteQuote(id: number): Promise<void> {
  return quoteService.delete(id);
}

export async function issueQuoteInvoice(quoteId: number): Promise<QuoteInvoiceDTO> {
  return quoteService.issueInvoice(quoteId);
}