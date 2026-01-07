import { FamilyDTO } from "@/lib/dto/family.dto";
import { MembershipDTO, MembershipWithSeasonDTO } from "@/lib/dto/membership.dto";
import { RegistrationDTO, RegistrationWithWorkshopDetailsDTO } from "@/lib/dto/registration.dto";

export type MemberDTO = {
  id: number;
  familyId: number | null;
  lastName: string;
  firstName: string;
  isMinor: boolean;
  email: string | null;
  phone: string | null;
  guardianLastName: string | null;
  guardianFirstName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MemberWithFamilyNameDTO = MemberDTO & {
  familyName: string
}

export type MemberWithFullDetailsDTO = MemberDTO & {
  family: FamilyDTO | null;
  registrations: RegistrationWithWorkshopDetailsDTO[] | null;
  memberships: MembershipWithSeasonDTO[] | null;
};

export type MemberWithMembershipsAndRegistrationsDTO = MemberDTO & {
  memberships: MembershipDTO[] | null;
  registrations: RegistrationDTO[] | null;
};