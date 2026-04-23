'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { createMember as create, deleteMember as remove, updateMember as update } from '@/lib/domain/family.orchestrator';
import { MemberDTO } from '@/lib/dto/member.dto';
import {
  CreateMemberInput,
  CreateMemberSchema,
  UpdateMemberInput,
  UpdateMemberSchema,
} from '@/lib/schemas/member.input';

export async function createMember(input: CreateMemberInput): Promise<MemberDTO> {
  return withAudit(async () => {
    const data = CreateMemberSchema.parse(input);
    return create(data);
  });
}

export async function updateMember(id: number, input: UpdateMemberInput): Promise<MemberDTO> {
  return withAudit(async () => {
    const data = UpdateMemberSchema.parse(input); 
    return update(id, data);
  });
}

export async function deleteMember(id: number): Promise<void> {
  return withAudit(async () => {
    return remove(id);
  });
}