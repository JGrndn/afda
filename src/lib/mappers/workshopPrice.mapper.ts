import type { Workshop as PrismaWorkshop, WorkshopPrice as PrismaWorkshopPrice, Season as PrismaSeason } from '@/generated/prisma/client';
import { WorkshopPriceDTO, WorkshopPriceWithSeasonInfoDTO, WorkshopPriceWithWorkshopInfoDTO } from '../dto/workshopPrice.dto';

export function toWorkshopPriceDTO(price: PrismaWorkshopPrice): WorkshopPriceDTO {
  return {
    id: price.id,
    workshopId: price.workshopId,
    seasonId: price.seasonId,
    amount: price.amount.toNumber(),
    createdAt: price.createdAt,
    updatedAt: price.updatedAt,
  };
}

export function toWorkshopPriceWithSeasonInfoDTO(price: PrismaWorkshopPrice & {season:PrismaSeason}): WorkshopPriceWithSeasonInfoDTO {
  return {
    id: price.id,
    workshopId: price.workshopId,
    seasonId: price.seasonId,
    seasonStart : price.season.startYear,
    seasonEnd : price.season.endYear,
    amount: price.amount.toNumber(),
    createdAt: price.createdAt,
    updatedAt: price.updatedAt,
  };
}

export function toWorkshopPricesWithSeasonInfoDTO(prices: (PrismaWorkshopPrice & {season: PrismaSeason })[]): WorkshopPriceWithSeasonInfoDTO[] {
  return prices.map(toWorkshopPriceWithSeasonInfoDTO);
}


export function toWorkshopPriceWithWorkshopInfoDTO(price: PrismaWorkshopPrice & {workshop:PrismaWorkshop}): WorkshopPriceWithWorkshopInfoDTO {
  return {
    id: price.id,
    workshopId: price.workshopId,
    seasonId: price.seasonId,
    workshopName: price.workshop.name,
    amount: price.amount.toNumber(),
    createdAt: price.createdAt,
    updatedAt: price.updatedAt,
  };
}

export function toWorkshopPricesWithWorkshopInfoDTO(prices: (PrismaWorkshopPrice & {workshop: PrismaWorkshop})[]): WorkshopPriceWithWorkshopInfoDTO[] {
  return prices.map(toWorkshopPriceWithWorkshopInfoDTO);
}