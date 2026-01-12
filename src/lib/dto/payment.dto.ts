import { PaymentType, PaymentStatus } from '@/lib/domain/enums/payment.enum';

export type PaymentDTO = {
  id: number;
  familyId: number;
  seasonId: number;
  amount: number;
  paymentType: PaymentType;
  paymentDate: Date;
  cashingDate: Date | null;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentWithDetailsDTO = PaymentDTO & {
  familyName: string;
  seasonYear: string;
};

export type FamilyPaymentSummaryDTO = {
  familyId: number;
  familyName: string;
  seasonId: number;
  seasonYear: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  paymentsCount: number;
  isFullyPaid: boolean;
};