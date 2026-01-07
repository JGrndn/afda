import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client'
import { QueryOptions } from '@/lib/hooks/query';
import { toSeasonDTO, toSeasonsDTO, toSeasonWithFullDetailsDTO, toSeasonWithPricesAndWorkshopDTO } from '@/lib/mappers/season.mapper';
import { SeasonDTO, SeasonWithFullDetailsDTO, SeasonWithPricesAndWorkshopDTO } from '@/lib/dto/season.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateSeasonInput, UpdateSeasonInput } from '@/lib/schemas/season.input';
import { SEASON_STATUS } from '@/lib/domain/season.enum';

export const seasonService = {
  async getAll(
    options?: QueryOptions<Prisma.SeasonOrderByWithRelationInput> & {
      status?: string;
    }
  ) : Promise<SeasonDTO[]> {
    const { filters = {}, orderBy } = options || {};
    const where: Prisma.SeasonWhereInput = {
      ...filters,
    };
    const finalOrderBy = orderBy || { startYear: 'desc' as const };
    const db = await prisma.season.findMany({
      where,
      orderBy: finalOrderBy,
    });
    return toSeasonsDTO(db);
  },

  async getById(id: number) : Promise<SeasonWithFullDetailsDTO | null> {
    const season : PrismaSeasonWithFullDetails | null = await prisma.season.findUnique({
      where : { id : id },
      include : {
        workshopPrices : {
          include : {
            workshop : true
          }
        },
        memberships : {
          include : {
            member: true
          }
        }
      }
    });
    return season ? toSeasonWithFullDetailsDTO(season) : null;
  },

  async getByIdWithWorkshopPrices(id: number) : Promise<SeasonWithPricesAndWorkshopDTO | null> {
    const season : PrismaSeasonWithPricesAndWorkshop | null = await prisma.season.findUnique({
      where : { id : id },
      include : {
        workshopPrices : {
          include : {
            workshop : true
          }
        }
      }
    });
    return season ? toSeasonWithPricesAndWorkshopDTO(season) : null;
  },

  async create(input: CreateSeasonInput): Promise<SeasonDTO> {
    if (input.startYear >= input.endYear){
      throw new DomainError(`L'année de début doit être antérieure à l'année de fin`, 'INVALID_SEASON_STARTYEAR_ENDYEAR');
    }
    try{
      const data = {
        ...input,
        membershipAmount: new Prisma.Decimal(input.membershipAmount),
        status: input.status
      };
      const result = await prisma.season.create({data});
      return toSeasonDTO(result);
    } catch(error: unknown){
        const e = error as any;
        if (e?.code === 'P2002'){
          throw new DomainError('Une saison pour ces années existe déjà', 'SEASON_ALREADY_EXISTS');
        }
      throw error; // à gérer au fur et à mesure que les cas se produisent
    }
  },

  async update(id: number, input:UpdateSeasonInput) : Promise<SeasonDTO>{
    if (input.status === SEASON_STATUS.ACTIVE){
      // one active season only
      await prisma.season.updateMany({
        where : {
          status : SEASON_STATUS.ACTIVE, 
          NOT: { id: id }
        },
        data : { status : SEASON_STATUS.INACTIVE }
      });
    }
    const data = {
      ...input,
      ...(input.membershipAmount && {
        membershipAmount: new Prisma.Decimal(input.membershipAmount),
      }),
    };
    const result = await prisma.season.update({
      where: { id : id },
      data : data
    });
    return toSeasonDTO(result);
  },

  async delete(id: number){
    return prisma.season.delete({
      where : { id : id }
    })
  }
};

export type PrismaSeasonWithPricesAndWorkshop =
  Prisma.SeasonGetPayload<{
    include: {
      workshopPrices: {
        include: {
          workshop: true;
        };
      };
    };
  }>;

export type PrismaSeasonWithFullDetails = 
  Prisma.SeasonGetPayload<{
    include : {
      workshopPrices : {
        include : {
          workshop : true
        }
      },
      memberships : {
        include : {
          member: true
        }
      }
    }
  }>;