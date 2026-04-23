'use server';

import { updateMembershipStatusesForFamily } from "@/lib/domain/updateMembershipStatusesForFamily";
import { withAudit } from "../audit/withAudit";

export async function reconcileFamilySeason(
  familyId:number,
  seasonId: number,
) : Promise<void> {
  return withAudit(async () => {
    return updateMembershipStatusesForFamily(familyId, seasonId);
  });
}