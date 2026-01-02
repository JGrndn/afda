import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryOptions } from '@/lib/hooks/query';
import {
  toWorkshopDTO,
  toWorkshopsDTO,
  toWorkshopWithPricesAndSeasonDTO,
} from '@/lib/mappers/workshop.mapper';
import { WorkshopDTO, WorkshopWithPricesAndSeasonDTO } from '@/lib/dto/workshop.dto';
import { DomainError } from '../errors/domain-error';
import { CreateWorkshopInput, UpdateWorkshopInput } from '../schemas/workshop.input';
import { WorkshopStatus } from '../domain/workshop.status';

export const workshopService = {
  async getAll(
    options?: QueryOptions<Prisma.WorkshopOrderByWithRelationInput> & {
      status?: WorkshopStatus;
      seasonId?: number;
      search?: string;
    }
  ): Promise<WorkshopDTO[]> {
    const { filters = {}, orderBy, status, search } = options || {};
    const where: Prisma.WorkshopWhereInput = {
      ...filters,
    };

    if (status !== undefined) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const finalOrderBy = orderBy || { name: 'asc' as const };
    const workshops = await prisma.workshop.findMany({
      where,
      orderBy: finalOrderBy,
    });

    return toWorkshopsDTO(workshops);
  },

  async getById(id: number): Promise<WorkshopWithPricesAndSeasonDTO | null> {
    const workshop:PrismaWorkshopWithPricesAndSeason | null = await prisma.workshop.findUnique({
      where: { id },
      include : {
        workshopPrices: {
          include:{
            season:true
          },
        },
      }
    });
    return workshop ? toWorkshopWithPricesAndSeasonDTO(workshop) : null;
  },

  async create(input: CreateWorkshopInput): Promise<WorkshopDTO> {
    try {
      const result = await prisma.workshop.create({
        data: input,
      });
      return toWorkshopDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2002') {
        throw new DomainError('Un atelier avec ce nom existe déjà', 'WORKSHOP_ALREADY_EXISTS');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateWorkshopInput): Promise<WorkshopDTO> {
    try {
      const result = await prisma.workshop.update({
        where: { id },
        data: input,
      });
      return toWorkshopDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Atelier introuvable', 'WORKSHOP_NOT_FOUND');
      }
      if (e?.code === 'P2002') {
        throw new DomainError('Un atelier avec ce nom existe déjà', 'WORKSHOP_ALREADY_EXISTS');
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await prisma.workshop.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Atelier introuvable', 'WORKSHOP_NOT_FOUND');
      }
      throw error;
    }
  },
};

export type PrismaWorkshopWithPricesAndSeason =
  Prisma.WorkshopGetPayload<{
    include: {
      workshopPrices: {
        include: {
          season: true;
        };
      };
    };
  }>;