import type { Workshop as PrismaWorkshop, WorkshopPrice as PrismaWorkshopPrice, Season as PrismaSeason } from '@/generated/prisma/client';
import type { WorkshopDTO, WorkshopPriceDTO, WorkshopPriceWithDetailsDTO, WorkshopWithPricesAndSeasonDTO } from '@/lib/dto/workshop.dto';
import { WorkshopStatusSchema } from '@/lib/schemas/workshop.schema';
import { PrismaWorkshopWithPricesAndSeason } from '../services/workshop.service';

export function toWorkshopDTO(workshop: PrismaWorkshop): WorkshopDTO {
  return {
    id: workshop.id,
    name: workshop.name,
    description: workshop.description,
    status: WorkshopStatusSchema.parse(workshop.status),
    allowMultiple: workshop.allowMultiple,
    maxPerMember: workshop.maxPerMember,
    createdAt: workshop.createdAt,
    updatedAt: workshop.updatedAt,
  };
}

export function toWorkshopsDTO(workshops: PrismaWorkshop[]): WorkshopDTO[] {
  return workshops.map(toWorkshopDTO);
}

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

export function toWorkshopPriceWithDetailsDTO(price: PrismaWorkshopPrice & {season:PrismaSeason}): WorkshopPriceWithDetailsDTO {
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

export function toWorkshopPricesWithDetailsDTO(prices: (PrismaWorkshopPrice & {season: PrismaSeason })[]): WorkshopPriceWithDetailsDTO[] {
  return prices.map(toWorkshopPriceWithDetailsDTO);
}

export function toWorkshopWithPricesAndSeasonDTO(workshop: PrismaWorkshopWithPricesAndSeason): WorkshopWithPricesAndSeasonDTO {
  return {
    ...toWorkshopDTO(workshop),
    prices: workshop.workshopPrices ? toWorkshopPricesWithDetailsDTO(workshop.workshopPrices) : [],
  };
}