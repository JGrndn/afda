import { z } from 'zod';
import { PaymentTypeSchema, PaymentStatusSchema } from '@/lib/schemas/payment.schema';

export const CreatePaymentSchema = z.object({
  familyId: z.number().int().positive(),
  seasonId: z.number().int().positive(),
  amount: z.number().positive(),
  paymentType: PaymentTypeSchema,
  paymentDate: z.date().optional(),
  cashingDate: z.date().optional().nullable(),
  reference: z.string().max(50).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

export const UpdatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  paymentType: PaymentTypeSchema.optional(),
  paymentDate: z.date().optional(),
  cashingDate: z.date().optional().nullable(),
  reference: z.string().max(50).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;

export { PaymentTypeSchema, PaymentStatusSchema };