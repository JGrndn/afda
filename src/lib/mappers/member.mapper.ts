import type { Member as PrismaMember } from '@/generated/prisma/client';
import type { MemberDTO, MemberWithFamilyNameDTO, MemberWithFullDetailsDTO,  } from '@/lib/dto/member.dto';
import { PrismaMemberWithFamily, PrismaMemberWithFullDetails } from '@/lib/services/member.service';
import { toFamilyDTO } from '@/lib/mappers/family.mapper';
import { toMembershipsWithSeasonDTO } from '@/lib/mappers/membership.mapper';
import { toRegistrationsWithWorkshopDetailsDTO } from '@/lib/mappers/registration.mapper';

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

export function toMemberWithFamilyNameDTO(member: PrismaMemberWithFamily) : MemberWithFamilyNameDTO {
  return {
    ...toMemberDTO(member),
    familyName:member.family?.name || ''
  }
}

export function toMemberWithFullDetailsDTO(member: PrismaMemberWithFullDetails): MemberWithFullDetailsDTO {
  return {
    ...toMemberDTO(member),
    family: member.family ? toFamilyDTO(member.family) : null,
    registrations: member.registrations ? toRegistrationsWithWorkshopDetailsDTO(member.registrations) : [],
    memberships : member.memberships ? toMembershipsWithSeasonDTO(member.memberships) : [],
  };
}