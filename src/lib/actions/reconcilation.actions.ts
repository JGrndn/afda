'use server';

import { updateMembershipStatusesForFamily } from "@/lib/domain/updateMembershipStatusesForFamily";

export async function reconcileFamilySeason(
  familyId:number,
  seasonId: number,
) : Promise<void> {
  return updateMembershipStatusesForFamily(familyId, seasonId);
}