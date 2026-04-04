'use client';

import { useResource } from '@/lib/hooks/useResources';
import { QuoteInvoiceWithDetailsDTO } from '@/lib/dto/quoteInvoice.dto';
import { QuoteInvoiceStatus } from '@/lib/domain/enums/quoteInvoice.enum';

interface UseQuoteInvoicesOptions {
  status?: QuoteInvoiceStatus;
  seasonId?: number;
  search?: string;
}

export function useQuoteInvoices(options: UseQuoteInvoicesOptions = {}) {
  const { status, seasonId, search } = options;

  const filters: Record<string, any> = {};
  if (status) filters.status = status;
  if (seasonId) filters.seasonId = seasonId;

  return useResource<QuoteInvoiceWithDetailsDTO>('/api/quote-invoices', {
    filters,
    search,
    defaultSort: { field: 'issuedAt', direction: 'desc' },
  });
}