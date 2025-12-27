import type { Season as PrismaSeason } from '@/generated/prisma/client';
import type { Season } from '@/lib/types/season';
import { SeasonStatusSchema } from '@/lib/schemas/season';

export function mapSeason(prismaSeason: PrismaSeason): Season {
  return {
    ...prismaSeason,
    status: SeasonStatusSchema.parse(prismaSeason.status),
  };
}

export function mapSeasons(seasons: PrismaSeason[]) : Season[]{
  return seasons.map(mapSeason);
}