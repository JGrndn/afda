export const QUOTE_INVOICE_STATUS = {
  ISSUED: 'issued',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

export type QuoteInvoiceStatus =
  (typeof QUOTE_INVOICE_STATUS)[keyof typeof QUOTE_INVOICE_STATUS];

export const QUOTE_INVOICE_PAYMENT_METHOD = {
  TRANSFER: 'transfer',
  CHECK: 'check',
  CASH: 'cash',
  CARD: 'card',
} as const;

export type QuoteInvoicePaymentMethod =
  (typeof QUOTE_INVOICE_PAYMENT_METHOD)[keyof typeof QUOTE_INVOICE_PAYMENT_METHOD];