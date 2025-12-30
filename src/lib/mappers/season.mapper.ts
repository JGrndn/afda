import type { Season as PrismaSeason } from '@/generated/prisma/client';
import type { SeasonDTO } from '@/lib/dto/season.dto';
import { SeasonStatusSchema } from '@/lib/schemas/season.schema';

export function toSeasonsDTO(seasons: PrismaSeason[]) : SeasonDTO[]{
  return seasons.map(toSeasonDTO);
}

export function toSeasonDTO(season: PrismaSeason): SeasonDTO{
  return {
    id: season.id,
    startYear: season.startYear,
    endYear: season.endYear,
    status: SeasonStatusSchema.parse(season.status),
    membershipAmount: season.membershipAmount.toNumber(),
    discountPercent: season.discountPercent,
    totalDonations: season.totalDonations.toNumber(),
    createdAt: season.createdAt,
    updatedAt: season.updatedAt,
  };
}