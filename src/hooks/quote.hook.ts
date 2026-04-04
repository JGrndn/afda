'use client';

import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { useResource } from '@/lib/hooks/useResources';
import {
  createQuote,
  updateQuote,
  deleteQuote,
  issueQuoteInvoice,
} from '@/app/(app)/quotes/quotes.actions';
import { QuoteDTO, QuoteInvoiceDTO, QuoteWithDetailsDTO } from '@/lib/dto/quote.dto';
import { CreateQuoteInput, UpdateQuoteInput } from '@/lib/schemas/quote.input';
import { QuoteStatus } from '@/lib/domain/enums/quote.enum';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseQuotesOptions {
  search?: string;
  status?: QuoteStatus;
  clientId?: number;
  sortBy?: 'createdAt' | 'totalAmount';
  sortDirection?: 'asc' | 'desc';
}

export function useQuotes(options: UseQuotesOptions = {}) {
  const { search, status, clientId, sortBy, sortDirection } = options;

  const filters: Record<string, any> = {};
  if (status) filters.status = status;
  if (clientId) filters.clientId = clientId;

  return useResource<QuoteDTO>('/api/quotes', {
    filters,
    search,
    sort:
      sortBy && sortDirection
        ? { field: sortBy, direction: sortDirection }
        : undefined,
    defaultSort: { field: 'createdAt', direction: 'desc' },
  });
}

export function useQuote(id: number) {
  const url = id ? `/api/quotes/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<QuoteWithDetailsDTO>(url, fetcher);

  return {
    quote: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export const useQuoteActions = createCrudActionsHook<
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteDTO
>({
  create: createQuote,
  update: updateQuote,
  remove: deleteQuote,
});

/**
 * Hook dédié à l'émission de la facture depuis un devis.
 * Séparé de useQuoteActions car ce n'est pas une opération CRUD standard.
 */
export function useIssueInvoice() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const issue = useCallback(async (quoteId: number): Promise<QuoteInvoiceDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      return await issueQuoteInvoice(quoteId);
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { issue, isLoading, error };
}