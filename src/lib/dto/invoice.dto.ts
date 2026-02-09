export interface InvoiceItemDTO {
  label: string;
  description?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface InvoiceDTO {
  id:number | null;
  familyId: number;
  seasonId: number;
  season: string;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'cancelled';
  invoiceNumber?: string | null;
  issuedAt?: Date | null;
  totalAmount: number;
  itemsByMember: InvoiceItemByMemberDTO[];
}

export interface InvoiceItemByMemberDTO{
  memberId: number;
  memberName: string;
  items: InvoiceItemDTO[];
}