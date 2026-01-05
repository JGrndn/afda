import type { Membership as PrismaMembership, Member as PrismaMember, Season as PrismaSeason } from '@/generated/prisma/client';
import type { MembershipDTO, MembershipSummaryDTO, MembershipWithMemberDTO, MembershipWithSeasonDTO } from '@/lib/dto/membership.dto';
import { MembershipStatusSchema } from '@/lib/schemas/membership.schema';
import { toSeasonDTO } from './season.mapper';

export function toMembershipDTO(membership: PrismaMembership): MembershipDTO {
  return {
    id: membership.id,
    memberId: membership.memberId,
    seasonId: membership.seasonId,
    familyOrder: membership.familyOrder,
    amount: membership.amount.toNumber(),
    status: MembershipStatusSchema.parse(membership.status),
    membershipDate: membership.membershipDate,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}

export function toMembershipsDTO(memberships: PrismaMembership[]): MembershipDTO[] {
  return memberships.map(toMembershipDTO);
}

export function toMembershipWithMemberDTO(
  membership: PrismaMembership & { member: PrismaMember }
): MembershipWithMemberDTO {
  return {
    ...toMembershipDTO(membership),
    memberName: `${membership.member.firstName} ${membership.member.lastName}`,
  };
}

export function toMembershipsWithMemberInfoDTO(memberships: (PrismaMembership & {member: PrismaMember})[]): MembershipWithMemberDTO[]{
  return memberships.map(toMembershipWithMemberDTO);
}

export function toMembershipWithSeasonDTO(membership: PrismaMembership & {season: PrismaSeason}) : MembershipWithSeasonDTO{
  return {
    ...toMembershipDTO(membership),
    season: toSeasonDTO(membership.season)
  }
}

export function toMembershipsWithSeasonDTO(memberships: (PrismaMembership & {season: PrismaSeason})[]) : MembershipWithSeasonDTO[]{
  return memberships.map(toMembershipWithSeasonDTO);
}

export function toMembershipSummaryDTO(
  membership: PrismaMembership & {
    member: {
      firstName: string;
      lastName: string;
      family: { name: string } | null;
      registrations: Array<{
        totalPrice: { toNumber: () => number };
        quantity: number;
      }>;
    };
    season: { startYear: number; endYear: number };
  }
): MembershipSummaryDTO {
  const workshopsAmount = membership.member.registrations
    .filter((wr) => wr)
    .reduce((sum, wr) => sum + wr.totalPrice.toNumber() * wr.quantity, 0);

  return {
    membershipId: membership.id,
    memberId: membership.memberId,
    memberName: `${membership.member.firstName} ${membership.member.lastName}`,
    familyName: membership.member.family?.name || null,
    seasonId: membership.seasonId,
    seasonYear: `${membership.season.startYear}-${membership.season.endYear}`,
    familyOrder: membership.familyOrder,
    membershipAmount: membership.amount.toNumber(),
    workshopsAmount,
    totalAmount: membership.amount.toNumber() + workshopsAmount,
    status: MembershipStatusSchema.parse(membership.status),
    membershipDate: membership.membershipDate,
  };
}