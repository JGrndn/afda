export const QUOTE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  INVOICED: 'invoiced',
} as const;
 
export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];
 