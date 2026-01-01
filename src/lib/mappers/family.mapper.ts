import type { Family as PrismaFamily } from '@/generated/prisma/client';
import type { FamilyDTO, FamilyWithMembersDTO } from '@/lib/dto/family.dto';

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

export function toFamilyWithMembersDTO(
  family: PrismaFamily & { members?: any[] }
): FamilyWithMembersDTO {
  return {
    ...toFamilyDTO(family),
    memberCount: family.members?.length ?? 0,
  };
}