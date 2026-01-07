import type { Payment as PrismaPayment } from '@/generated/prisma/client';
import type { PaymentDTO, PaymentWithDetailsDTO } from '@/lib/dto/payment.dto';
import { PaymentTypeSchema, PaymentStatusSchema } from '@/lib/schemas/payment.schema';

export function toPaymentDTO(payment: PrismaPayment): PaymentDTO {
  return {
    id: payment.id,
    familyId: payment.familyId,
    seasonId: payment.seasonId,
    amount: payment.amount.toNumber(),
    paymentType: PaymentTypeSchema.parse(payment.paymentType),
    paymentDate: payment.paymentDate,
    cashingDate: payment.cashingDate,
    status: PaymentStatusSchema.parse(payment.status),
    reference: payment.reference,
    notes: payment.notes,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

export function toPaymentsDTO(payments: PrismaPayment[]): PaymentDTO[] {
  return payments.map(toPaymentDTO);
}

export function toPaymentWithDetailsDTO(
  payment: PrismaPayment & {
    family: { name: string };
    season: { startYear: number; endYear: number };
  }
): PaymentWithDetailsDTO {
  return {
    ...toPaymentDTO(payment),
    familyName: payment.family.name,
    seasonYear: `${payment.season.startYear}-${payment.season.endYear}`,
  };
}