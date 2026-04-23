'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { addFamilyPayment, deleteFamilyPayment, updateFamilyPayment } from '@/lib/domain/familyPayment.orchestrator';
import { PaymentDTO } from '@/lib/dto/payment.dto';
import {
  CreatePaymentInput,
  CreatePaymentSchema,
  UpdatePaymentInput,
  UpdatePaymentSchema,
} from '@/lib/schemas/payment.input';

export async function createPayment(input: CreatePaymentInput): Promise<PaymentDTO> {
  return withAudit(async () => {
    const data = CreatePaymentSchema.parse(input);
    return addFamilyPayment(data);
  });
}

export async function updatePayment(id: number, input: UpdatePaymentInput): Promise<PaymentDTO> {
  return withAudit(async () => {
    const data = UpdatePaymentSchema.parse(input);
    return updateFamilyPayment(id, data);
  });
}

export async function deletePayment(id: number): Promise<void> {
  return withAudit(async () => {
    return deleteFamilyPayment(id);
  });
}