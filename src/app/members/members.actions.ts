'use server';

import { MemberDTO } from '@/lib/dto/member.dto';
import {
  CreateMemberInput,
  CreateMemberSchema,
  UpdateMemberInput,
  UpdateMemberSchema,
} from '@/lib/schemas/member.input';
import { memberService } from '@/lib/services/member.service';

export async function createMember(input: CreateMemberInput): Promise<MemberDTO> {
  const data = CreateMemberSchema.parse(input);
  const result = await memberService.create(data);
  return result;
}

export async function updateMember(id: number, input: UpdateMemberInput): Promise<MemberDTO> {
  const data = UpdateMemberSchema.parse(input);
  const result = await memberService.update(id, data);
  return result;
}

export async function deleteMember(id: number): Promise<void> {
  await memberService.delete(id);
}