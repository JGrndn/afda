import { MembershipStatus } from '@/lib/domain/membership.enum';
import { SeasonDTO } from './season.dto';

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

export type MembershipWithMemberDTO = MembershipDTO & {
  memberName: string;
};

export type MembershipWithSeasonDTO =MembershipDTO & {
  season : SeasonDTO
}

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