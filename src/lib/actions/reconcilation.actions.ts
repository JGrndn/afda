'use server';

import { updateMembershipStatusesForFamily } from "@/lib/domain/updateMembershipStatusesForFamily";
import { withAudit } from "../audit/withAudit";
import { requireRoleAction } from "../auth/action-protection";

export async function reconcileFamilySeason(
  familyId:number,
  seasonId: number,
) : Promise<void> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    return updateMembershipStatusesForFamily(familyId, seasonId);
  });
}