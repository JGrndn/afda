import { CreatePaymentInput, UpdatePaymentInput } from '@/lib/schemas/payment.input'
import { paymentService, membershipService, registrationService, memberService } from '@/lib/services'
import { PaymentDTO } from '@/lib/dto/payment.dto';
import { computeFinancialStats } from './finance';
import { MEMBERSHIP_STATUS, MembershipStatus } from '@/lib/domain/membership.enum';

async function checkStatusMembershipsShouldHave(familyId: number, seasonId:number, memberIds: number[]): Promise<MembershipStatus> {
  const payments= await paymentService.getAll({familyId: familyId, seasonId: seasonId});
  const memberships = await membershipService.getAll({memberIds: memberIds, seasonId: seasonId});
  const registrations = await registrationService.getAll({memberIds: memberIds, seasonId: seasonId});
  const stats = computeFinancialStats([{
      memberships : memberships,
      registrations: registrations,
    }],
    payments,
    seasonId
  );
  return (stats.balance <= 0) ? MEMBERSHIP_STATUS.COMPLETED : MEMBERSHIP_STATUS.PENDING;
}

export async function addFamilyPayment(
  input: CreatePaymentInput
): Promise<PaymentDTO> {
  
  const newPayment = await paymentService.create(input);
  const members = await memberService.getAll({familyId: input.familyId});
  const memberIds = members.map(m => m.id);
  const newMembershipsStatus = await checkStatusMembershipsShouldHave(input.familyId, input.seasonId, memberIds);
  
  if (newMembershipsStatus === MEMBERSHIP_STATUS.COMPLETED){
    await membershipService.updateStatuses(memberIds, input.seasonId, MEMBERSHIP_STATUS.PENDING, MEMBERSHIP_STATUS.COMPLETED); 
  }
  return newPayment;
}

export async function updateFamilyPayment(
  paymentId:number,
  input: UpdatePaymentInput
): Promise<PaymentDTO>{
  const payment = await paymentService.update(paymentId, input);
  const familyId = payment?.familyId;
  const seasonId = payment?.seasonId;
  const members = await memberService.getAll({familyId: familyId});
  const memberIds = members.map(m => m.id);
  const newMembershipsStatus = await checkStatusMembershipsShouldHave(familyId, seasonId, memberIds);

  if (newMembershipsStatus === MEMBERSHIP_STATUS.COMPLETED){
    await membershipService.updateStatuses(memberIds, seasonId, MEMBERSHIP_STATUS.PENDING, MEMBERSHIP_STATUS.COMPLETED); 
  } else {
    await membershipService.updateStatuses(memberIds, seasonId, MEMBERSHIP_STATUS.COMPLETED, MEMBERSHIP_STATUS.PENDING);
  }
  return payment;
}

export async function deleteFamilyPayment(paymentId:number): Promise<void>{
  const payment = await paymentService.getById(paymentId);
  if (payment){
    const familyId = payment?.familyId;
    const seasonId = payment?.seasonId;
    const members = await memberService.getAll({familyId: familyId});
    const memberIds = members.map(m => m.id);
    const newMembershipsStatus = await checkStatusMembershipsShouldHave(familyId, seasonId, memberIds);

    if (newMembershipsStatus === MEMBERSHIP_STATUS.PENDING){
      await membershipService.updateStatuses(memberIds, seasonId, MEMBERSHIP_STATUS.COMPLETED, MEMBERSHIP_STATUS.PENDING);
    }
  }
}
