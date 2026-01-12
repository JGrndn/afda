import { CreatePaymentInput, UpdatePaymentInput } from '@/lib/schemas/payment.input'
import { paymentService } from '@/lib/services'
import { PaymentDTO } from '@/lib/dto/payment.dto';
import { updateMembershipStatusesForFamily } from './updateMembershipStatusesForFamily';

export async function addFamilyPayment(
  input: CreatePaymentInput
): Promise<PaymentDTO> {
  const newPayment = await paymentService.create(input);
  await updateMembershipStatusesForFamily(newPayment.familyId, newPayment.seasonId);
  return newPayment;
}

export async function updateFamilyPayment(
  paymentId:number,
  input: UpdatePaymentInput
): Promise<PaymentDTO>{
  const payment = await paymentService.update(paymentId, input);
  const familyId = payment?.familyId;
  const seasonId = payment?.seasonId;
  await updateMembershipStatusesForFamily(familyId, seasonId);
  return payment;
}

export async function deleteFamilyPayment(paymentId:number): Promise<void>{
  const payment = await paymentService.getById(paymentId);
  if (payment){
    await paymentService.delete(paymentId);
    const familyId = payment?.familyId;
    const seasonId = payment?.seasonId;
    await updateMembershipStatusesForFamily(familyId, seasonId);
  }
}
