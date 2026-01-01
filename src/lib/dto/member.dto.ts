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

export type MemberWithFamilyDTO = MemberDTO & {
  familyName: string | null;
};

export type MemberWithFullDetailsDTO = MemberWithFamilyDTO & {
  
};