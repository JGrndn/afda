import { MembershipDTO } from "@/lib/dto/membership.dto";
import { RegistrationDTO } from "@/lib/dto/registration.dto";
import { PaymentDTO } from "@/lib/dto/payment.dto";
import { PAYMENT_STATUS } from "./enums/payment.enum";

export type FamilyFinancialStats = {
  totalPaid: number;
  totalDue: number;
  balance: number;
};

export function computeFinancialStats(
  source: {
    memberships?: MembershipDTO[] | null;
    registrations?: RegistrationDTO[] | null;
  }[],
  payments: PaymentDTO[] | null,
  seasonId: number
): FamilyFinancialStats {
  let totalMemberships = 0;
  let totalRegistrations = 0;

  for (const item of source) {
    if (item.memberships) {
      for (const m of item.memberships) {
        if (m.seasonId === seasonId) {
          totalMemberships += m.amount;
        }
      }
    }

    if (item.registrations) {
      for (const r of item.registrations) {
        if (r.seasonId === seasonId) {
          totalRegistrations += r.totalPrice;
        }
      }
    }
  }
  
  let totalPaid = 0;
  if (payments){
    for(const p of payments){
      if (p.seasonId === seasonId && p.status === PAYMENT_STATUS.COMPLETED){
        totalPaid += p.amount
      }
    }
  }
  let totalDue = totalMemberships + totalRegistrations

  return {
    totalPaid: totalPaid,
    totalDue: totalDue,
    balance: totalDue - totalPaid
  };
}