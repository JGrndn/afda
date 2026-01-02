import type { Family as PrismaFamily, Member as PrismaMember } from '@/generated/prisma/client';
import type { FamilyDTO, FamilyWithFullDetailsDTO,  } from '@/lib/dto/family.dto';
import { toMembersDTO } from './member.mapper';

export function toFamilyDTO(family: PrismaFamily): FamilyDTO {
  return {
    id: family.id,
    name: family.name,
    address: family.address,
    phone: family.phone,
    email: family.email,
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
  };
}

export function toFamiliesDTO(families: PrismaFamily[]): FamilyDTO[] {
  return families.map(toFamilyDTO);
}

export function toFamilyWithFullDetailsDTO(
  family: PrismaFamily & { members?: PrismaMember[] }
): FamilyWithFullDetailsDTO {
  return {
    ...toFamilyDTO(family),
    members: family.members ? toMembersDTO(family.members) : [],
  };
}