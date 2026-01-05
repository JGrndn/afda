import type { Workshop as PrismaWorkshop } from '@/generated/prisma/client';
import type { WorkshopDTO, WorkshopWithPricesAndSeasonDTO } from '@/lib/dto/workshop.dto';
import { WorkshopStatusSchema } from '@/lib/schemas/workshop.schema';
import { PrismaWorkshopWithPricesAndSeason } from '../services/workshop.service';
import { toWorkshopPricesWithSeasonInfoDTO } from './workshopPrice.mapper';


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

export function toWorkshopWithPricesAndSeasonDTO(workshop: PrismaWorkshopWithPricesAndSeason): WorkshopWithPricesAndSeasonDTO {
  return {
    ...toWorkshopDTO(workshop),
    prices: toWorkshopPricesWithSeasonInfoDTO(workshop.workshopPrices),
  };
}

export function toWorkshopsWithPricesAndSeasonDTO(workshops: PrismaWorkshopWithPricesAndSeason[]) : WorkshopWithPricesAndSeasonDTO[]{
  return workshops.map(toWorkshopWithPricesAndSeasonDTO);
}