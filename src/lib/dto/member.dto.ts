import { FamilyDTO } from "./family.dto";

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
};