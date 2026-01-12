import { memberService, membershipService, paymentService, registrationService } from "@/lib/services";
import { computeFinancialStats } from "@/lib/domain/finance";
import { MEMBERSHIP_STATUS } from "@/lib/domain/membership.enum";

export async function updateMembershipStatusesForFamily(familyId: number, seasonId: number): Promise<void>{
  const payments= await paymentService.getAll({familyId: familyId, seasonId: seasonId});
  const members = await memberService.getAll({familyId: familyId});
  const memberIds = members.map(m => m.id);
  const memberships = await membershipService.getAll({memberIds: memberIds, seasonId: seasonId});
  const registrations = await registrationService.getAll({memberIds: memberIds, seasonId: seasonId});

  const stats = computeFinancialStats([{
      memberships : memberships,
      registrations: registrations,
    }],
    payments,
    seasonId
  );
  const status = (stats.balance <= 0) ? MEMBERSHIP_STATUS.COMPLETED : MEMBERSHIP_STATUS.PENDING;
  
  if (status === MEMBERSHIP_STATUS.COMPLETED){
    await membershipService.updateStatuses(memberIds, seasonId, MEMBERSHIP_STATUS.PENDING, MEMBERSHIP_STATUS.COMPLETED); 
  } else {
    await membershipService.updateStatuses(memberIds, seasonId, MEMBERSHIP_STATUS.COMPLETED, MEMBERSHIP_STATUS.PENDING);
  }
}