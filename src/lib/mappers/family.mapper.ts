import type { Family as PrismaFamily } from '@/generated/prisma/client';
import type { FamilyDTO, FamilyWithFullDetailsDTO,  } from '@/lib/dto/family.dto';
import { toMembersWithMembershipsAndRegistrationsDTO } from '@/lib/mappers/member.mapper';
import { PrismaFamilyWithFullDetails } from '@/lib/services/family.service';
import { toPaymentsDTO } from './payment.mapper';

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

export function toFamilyWithFullDetailsDTO(family: PrismaFamilyWithFullDetails): FamilyWithFullDetailsDTO {
  return {
    ...toFamilyDTO(family),
    members: family.members ? toMembersWithMembershipsAndRegistrationsDTO(family.members) : [],
    payments: family.payments ? toPaymentsDTO(family.payments) : [],
  };
}