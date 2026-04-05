export const PAYMENT_FILTER_STATUS = {
  NOT_PAID: 'en-retard',
  PAID: 'a-jour',
} as const;

export type PaymentFilterStatus =
  (typeof PAYMENT_FILTER_STATUS)[keyof typeof PAYMENT_FILTER_STATUS];