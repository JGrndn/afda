import { z } from 'zod';
import { QuoteStatusSchema } from '@/lib/schemas/quote.schema';
import { QUOTE_STATUS } from '@/lib/domain/enums/quote.enum';

export const QuoteItemInputSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis').max(255),
  description: z.string().nullable().optional(),
  unitPrice: z.number().positive('Le prix unitaire doit être positif'),
  quantity: z.number().int().positive('La quantité doit être positive').default(1),
  lineTotal: z.number(),
});

export type QuoteItemInput = z.infer<typeof QuoteItemInputSchema>;

export const CreateQuoteSchema = z.object({
  clientId: z.number().int().positive(),
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().nullable().optional(),
  status: QuoteStatusSchema.default(QUOTE_STATUS.DRAFT),
  validUntil: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(QuoteItemInputSchema).min(1, 'Au moins une ligne est requise'),
});

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>;

export const UpdateQuoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  status: QuoteStatusSchema.optional(),
  validUntil: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(QuoteItemInputSchema).min(1).optional(),
});

export type UpdateQuoteInput = z.infer<typeof UpdateQuoteSchema>;