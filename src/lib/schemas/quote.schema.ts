import { z } from 'zod';
import { QUOTE_STATUS, QuoteStatus } from '@/lib/domain/enums/quote.enum';

export const QuoteStatusSchema = z.enum(
  Object.values(QUOTE_STATUS) as [QuoteStatus, ...QuoteStatus[]]
);

export const QUOTE_STATUS_OPTIONS = QuoteStatusSchema.options;