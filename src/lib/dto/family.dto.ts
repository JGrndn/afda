import { MemberDTO } from "@/lib/dto/member.dto";

export type FamilyDTO = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FamilyWithFullDetailsDTO = FamilyDTO & {
  members: MemberDTO[] | null;
};