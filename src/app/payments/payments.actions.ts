'use server';

import { PaymentDTO, FamilyPaymentSummaryDTO } from '@/lib/dto/payment.dto';
import {
  CreatePaymentInput,
  CreatePaymentSchema,
  UpdatePaymentInput,
  UpdatePaymentSchema,
} from '@/lib/schemas/payment.input';
import { paymentService } from '@/lib/services/payment.service';

export async function createPayment(input: CreatePaymentInput): Promise<PaymentDTO> {
  const data = CreatePaymentSchema.parse(input);
  const result = await paymentService.create(data);
  return result;
}

export async function updatePayment(id: number, input: UpdatePaymentInput): Promise<PaymentDTO> {
  const data = UpdatePaymentSchema.parse(input);
  const result = await paymentService.update(id, data);
  return result;
}

export async function deletePayment(id: number): Promise<void> {
  await paymentService.delete(id);
}

export async function getFamilyBalance(
  familyId: number,
  seasonId: number
): Promise<FamilyPaymentSummaryDTO> {
  return await paymentService.calculateFamilyBalance(familyId, seasonId);
}