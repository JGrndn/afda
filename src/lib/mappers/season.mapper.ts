import type { Season as PrismaSeason } from '@/generated/prisma/client';
import type { SeasonDTO, SeasonWithPricesAndWorkshopDTO } from '@/lib/dto/season.dto';
import { SeasonStatusSchema } from '@/lib/schemas/season.schema';
import { PrismaSeasonWithPricesAndWorkshop } from '@/lib/services/season.service';
import { toWorkshopPricesWithWorkshopInfoDTO } from '@/lib/mappers/workshopPrice.mapper';

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

export function toSeasonsDTO(seasons: PrismaSeason[]) : SeasonDTO[]{
  return seasons.map(toSeasonDTO);
}

export function toSeasonWithPricesAndWorkshopDTO(season: PrismaSeasonWithPricesAndWorkshop): SeasonWithPricesAndWorkshopDTO {
  return {
    ...toSeasonDTO(season),
    prices: season.workshopPrices ? toWorkshopPricesWithWorkshopInfoDTO(season.workshopPrices) : [],
  };
}