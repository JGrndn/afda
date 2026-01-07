import { MemberWithMembershipsAndRegistrationsDTO } from "@/lib/dto/member.dto";
import { PaymentDTO } from "@/lib/dto/payment.dto";

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
  members: MemberWithMembershipsAndRegistrationsDTO[] | null;
  payments: PaymentDTO[] | null;
};