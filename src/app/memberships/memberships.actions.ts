'use server';

import { MembershipDTO } from '@/lib/dto/membership.dto';
import {
  CreateMembershipInput,
  CreateMembershipSchema,
  UpdateMembershipInput,
  UpdateMembershipSchema,
} from '@/lib/schemas/membership.input';
import { membershipService } from '@/lib/services/membership.service';

export async function createMembership(input: CreateMembershipInput): Promise<MembershipDTO> {
  const data = CreateMembershipSchema.parse(input);
  const result = await membershipService.create(data);
  return result;
}

export async function updateMembership(
  id: number,
  input: UpdateMembershipInput
): Promise<MembershipDTO> {
  const data = UpdateMembershipSchema.parse(input);
  const result = await membershipService.update(id, data);
  return result;
}

export async function deleteMembership(id: number): Promise<void> {
  await membershipService.delete(id);
}