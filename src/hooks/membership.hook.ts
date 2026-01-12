'use client';

import { createMembership, updateMembership, deleteMembership } from '@/app/memberships/memberships.actions';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';
import { MembershipDTO } from '@/lib/dto/membership.dto';
import { CreateMembershipInput, UpdateMembershipInput } from '@/lib/schemas/membership.input';

export const useMembershipActions = createCrudActionsHook<
  CreateMembershipInput,
  UpdateMembershipInput,
  MembershipDTO
>({
  create: createMembership,
  update: updateMembership,
  remove: deleteMembership,
});