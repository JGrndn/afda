'use server';

import { withAudit } from '@/lib/audit/withAudit';
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
  return withAudit(async () => {
    const data = CreateQuoteSchema.parse(input);
    return quoteService.create(data);
  });
}

export async function updateQuote(id: number, input: UpdateQuoteInput): Promise<QuoteDTO> {
  return withAudit(async () => {
    const data = UpdateQuoteSchema.parse(input);
    return quoteService.update(id, data);
  });
}

export async function updateQuoteStatus(id: number, status: QuoteStatus): Promise<QuoteDTO> {
  return withAudit(async () => {
    return quoteService.updateStatus(id, status);
  });
}

export async function deleteQuote(id: number): Promise<void> {
  return withAudit(async () => {
    return quoteService.delete(id);
  });
}

export async function issueQuoteInvoice(quoteId: number): Promise<QuoteInvoiceDTO> {
  return withAudit(async () => {
    return quoteService.issueInvoice(quoteId);
  });
}

export async function markQuoteInvoicePaid(
  quoteInvoiceId: number,
  input: MarkInvoicePaidInput
): Promise<QuoteInvoiceDTO> {
  return withAudit(async () => {
    const data = MarkInvoicePaidSchema.parse(input);
    return quoteService.markInvoicePaid(quoteInvoiceId, data);
  });
}

export async function cancelQuoteInvoice(quoteInvoiceId: number): Promise<QuoteInvoiceDTO> {
  return withAudit(async () => {
    return quoteService.cancelInvoice(quoteInvoiceId);
  });
}