import type { Member as PrismaMember } from '@/generated/prisma/client';
import type { MemberDTO, MemberWithFamilyDTO } from '@/lib/dto/member.dto';

export function toMemberDTO(member: PrismaMember): MemberDTO {
  return {
    id: member.id,
    familyId: member.familyId,
    lastName: member.lastName,
    firstName: member.firstName,
    isMinor: member.isMinor,
    email: member.email,
    phone: member.phone,
    guardianLastName: member.guardianLastName,
    guardianFirstName: member.guardianFirstName,
    guardianPhone: member.guardianPhone,
    guardianEmail: member.guardianEmail,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export function toMembersDTO(members: PrismaMember[]): MemberDTO[] {
  return members.map(toMemberDTO);
}

export function toMemberWithFamilyDTO(
  member: PrismaMember & { family?: { name: string } | null }
): MemberWithFamilyDTO {
  return {
    ...toMemberDTO(member),
    familyName: member.family?.name ?? null,
  };
}