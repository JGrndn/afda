import type { Registration as PrismaRegistration, Workshop as PrismaWorkshop } from '@/generated/prisma/client';
import type {
  RegistrationDTO,
  RegistrationWithDetailsDTO,
  RegistrationWithWorkshopDetailsDTO,
} from '@/lib/dto/registration.dto';
import { toWorkshopDTO } from './workshop.mapper';

export function toRegistrationDTO(registration: PrismaRegistration): RegistrationDTO {
  return {
    id: registration.id,
    memberId: registration.memberId,
    seasonId: registration.seasonId,
    workshopId: registration.workshopId,
    quantity: registration.quantity,
    appliedPrice: registration.appliedPrice.toNumber(),
    discountPercent: registration.discountPercent.toNumber(),
    registrationDate: registration.registrationDate,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt,
  };
}

export function toRegistrationsDTO(registrations: PrismaRegistration[]): RegistrationDTO[] {
  return registrations.map(toRegistrationDTO);
}

export function toRegistrationWithDetailsDTO(
  registration: PrismaRegistration & {
    member: { firstName: string; lastName: string };
    workshop: { name: string };
    season: { startYear: number; endYear: number };
  }
): RegistrationWithDetailsDTO {
  const baseDTO = toRegistrationDTO(registration);
  return {
    ...baseDTO,
    memberName: `${registration.member.firstName} ${registration.member.lastName}`,
    workshopName: registration.workshop.name,
    seasonYear: `${registration.season.startYear}-${registration.season.endYear}`,
    totalPrice: baseDTO.appliedPrice * baseDTO.quantity,
  };
}

export function toRegistrationWithWorkshopDetailsDTO(
  registration: PrismaRegistration & { 
    workshop: PrismaWorkshop
}): RegistrationWithWorkshopDetailsDTO {
  return {
    ...toRegistrationDTO(registration),
    workshop: toWorkshopDTO(registration.workshop),
  };
}

export function toRegistrationsWithWorkshopDetailsDTO(
  registrations: (PrismaRegistration & { workshop: PrismaWorkshop })[]
) : RegistrationWithWorkshopDetailsDTO[]{
  return registrations.map(toRegistrationWithWorkshopDetailsDTO);
}