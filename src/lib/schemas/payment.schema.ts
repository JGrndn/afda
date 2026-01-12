import { z } from 'zod';
import { PAYMENT_TYPE, PAYMENT_STATUS, PaymentType, PaymentStatus } from '@/lib/domain/enums/payment.enum';

export const PaymentTypeSchema = z.enum(
  Object.values(PAYMENT_TYPE) as [PaymentType, ...PaymentType[]]
);

export const PaymentStatusSchema = z.enum(
  Object.values(PAYMENT_STATUS) as [PaymentStatus, ...PaymentStatus[]]
);

export const PAYMENT_TYPE_OPTIONS = PaymentTypeSchema.options;
export const PAYMENT_STATUS_OPTIONS = PaymentStatusSchema.options;