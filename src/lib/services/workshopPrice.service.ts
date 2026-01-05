import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { toWorkshopPriceDTO } from '@/lib/mappers/workshopPrice.mapper';
import { WorkshopPriceDTO } from '@/lib/dto/workshopPrice.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateWorkshopPriceInput, UpdateWorkshopPriceInput } from '@/lib/schemas/workshop.input';

export const workshopPriceService = {
  async create(input: CreateWorkshopPriceInput): Promise<WorkshopPriceDTO> {
    try {
      const data = {
        ...input,
        amount: new Prisma.Decimal(input.amount),
      };

      const result = await prisma.workshopPrice.create({ data });
      return toWorkshopPriceDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2002') {
        throw new DomainError(
          'Un prix existe déjà pour cet atelier et cette saison',
          'WORKSHOP_PRICE_ALREADY_EXISTS'
        );
      }
      if (e?.code === 'P2003') {
        throw new DomainError('Atelier ou saison introuvable', 'WORKSHOP_OR_SEASON_NOT_FOUND');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateWorkshopPriceInput): Promise<WorkshopPriceDTO> {
    try {
      const data = {
        amount: new Prisma.Decimal(input.amount),
      };

      const result = await prisma.workshopPrice.update({
        where: { id },
        data,
      });
      return toWorkshopPriceDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Prix introuvable', 'WORKSHOP_PRICE_NOT_FOUND');
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await prisma.workshopPrice.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Prix introuvable', 'WORKSHOP_PRICE_NOT_FOUND');
      }
      throw error;
    }
  },

  async deleteByWorkshopAndSeason(workshopId: number, seasonId: number): Promise<void> {
    try {
      await prisma.workshopPrice.delete({
        where: {
          workshopId_seasonId: {
            workshopId,
            seasonId,
          },
        },
      });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Prix introuvable', 'WORKSHOP_PRICE_NOT_FOUND');
      }
      throw error;
    }
  },
};