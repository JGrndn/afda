import { CreateMemberInput, UpdateMemberInput } from '@/lib/schemas/member.input'
import { MemberDTO } from '@/lib/dto/member.dto';
import { memberService } from '@/lib/services';

export async function createMember(input: CreateMemberInput): Promise<MemberDTO> {
  return await memberService.create(input);
}

export async function updateMember(id: number, input: UpdateMemberInput) : Promise<MemberDTO>{
  const member = await memberService.update(id, input);
  return member;
}

export async function deleteMember(memberId:number): Promise<void>{
  await memberService.delete(memberId);
}
