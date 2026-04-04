export type ClientDTO = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  contact: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientWithQuotesDTO = ClientDTO & {
  quotes: ClientQuoteSummaryDTO[];
};

export type ClientQuoteSummaryDTO = {
  id: number;
  title: string;
  status: string;
  quoteNumber: string | null;
  totalAmount: number;
  issuedAt: Date | null;
  validUntil: Date | null;
};