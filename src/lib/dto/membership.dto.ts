import { MembershipStatus } from '@/lib/domain/membership.status';

export type MembershipDTO = {
  id: number;
  memberId: number;
  seasonId: number;
  familyOrder: number;
  amount: number;
  status: MembershipStatus;
  membershipDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MembershipWithDetailsDTO = MembershipDTO & {
  memberName: string;
  memberEmail: string | null;
  familyName: string | null;
  seasonYear: string;
  workshopsCount: number;
};

export type MembershipSummaryDTO = {
  membershipId: number;
  memberId: number;
  memberName: string;
  familyName: string | null;
  seasonId: number;
  seasonYear: string;
  familyOrder: number;
  membershipAmount: number;
  workshopsAmount: number;
  totalAmount: number;
  status: MembershipStatus;
  membershipDate: Date;
};