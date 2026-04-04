import { z } from 'zod';
import {
  QUOTE_INVOICE_STATUS,
  QuoteInvoiceStatus,
  QUOTE_INVOICE_PAYMENT_METHOD,
  QuoteInvoicePaymentMethod,
} from '@/lib/domain/enums/quoteInvoice.enum';

export const QuoteInvoiceStatusSchema = z.enum(
  Object.values(QUOTE_INVOICE_STATUS) as [QuoteInvoiceStatus, ...QuoteInvoiceStatus[]]
);

export const QuoteInvoicePaymentMethodSchema = z.enum(
  Object.values(QUOTE_INVOICE_PAYMENT_METHOD) as [
    QuoteInvoicePaymentMethod,
    ...QuoteInvoicePaymentMethod[],
  ]
);

export const MarkInvoicePaidSchema = z.object({
  paidAt: z.coerce.date().optional().default(() => new Date()),
  paymentMethod: QuoteInvoicePaymentMethodSchema,
});

export type MarkInvoicePaidInput = z.infer<typeof MarkInvoicePaidSchema>;