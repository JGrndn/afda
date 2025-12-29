import type { Season as PrismaSeason } from '@/generated/prisma/client';
import type { Season } from '@/lib/types/season.type';
import { SeasonStatusSchema } from '@/lib/schemas/season.schema';

export function mapSeason(prismaSeason: PrismaSeason): Season {
  return {
    ...prismaSeason,
    status: SeasonStatusSchema.parse(prismaSeason.status),
  };
}

export function mapSeasons(seasons: PrismaSeason[]) : Season[]{
  return seasons.map(mapSeason);
}

export function toSeasonDTO(season: PrismaSeason){
  return {
    id: season.id,
    startYear: season.startYear,
    endYear: season.endYear,
    status: season.status,
    membershipAmount: season.membershipAmount.toNumber(),
    discountPercent: season.discountPercent,
    totalDonations: season.totalDonations.toNumber(),
    createdAt: season.createdAt,
    updatedAt: season.updatedAt,
  }
}