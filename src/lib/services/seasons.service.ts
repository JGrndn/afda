import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client'
import { extractScalarFields } from '@/lib/utils';
import { QueryOptions } from '@/lib/hooks/query';
import { mapSeason, mapSeasons, toSeasonDTO } from '@/lib/mappers/season.mapper';
import { Season } from '@/lib/types/season.type';
import { SEASON_STATUS } from '@/lib/schemas/season.schema';

export const seasonService = {
  async getAll(
    options?: QueryOptions<Prisma.SeasonOrderByWithRelationInput> & {
      status?: string;
    }
  ) : Promise<Season[]> {
    const { filters = {}, orderBy } = options || {};

    const where: Prisma.SeasonWhereInput = {
      ...filters,
    };
    const finalOrderBy = orderBy || { startYear: 'desc' as const };
    const db = await prisma.season.findMany({
      where,
      orderBy: finalOrderBy,
    });

    return mapSeasons(db);
  },

  async getById(id: number) : Promise<Season | null> {
    const db = await prisma.season.findUnique({
      where : { id : id }
    });
    return db ? mapSeason(db) : null;
  },

  async getActive(): Promise<Season | null>{
    const db =  await prisma.season.findFirst({
      where : { status : SEASON_STATUS.ACTIVE}
    });
    return db ? mapSeason(db) : null;
  },

  async create(data: Prisma.SeasonCreateInput){
    const result = await prisma.season.create({data});
    return toSeasonDTO(result);
  },

  async update(id: number, data:Prisma.SeasonUpdateInput){
    if (data.status === SEASON_STATUS.ACTIVE){
      // one active season only
      await prisma.season.updateMany({
        where : {
          status : SEASON_STATUS.ACTIVE, 
          NOT: { id: id }
        },
        data : { status : SEASON_STATUS.INACTIVE }
      });
    }
    const cleanData = extractScalarFields(data) as Prisma.SeasonUpdateInput;
    return prisma.season.update({
      where: { id : id },
      data : cleanData
    });
  },

  async setActive(id: number){
    // one active season only
    await prisma.season.updateMany({
      where : { status : SEASON_STATUS.ACTIVE },
      data : { status : SEASON_STATUS.INACTIVE },
    });
    return prisma.season.update({
      where : { id : id },
      data : { status : SEASON_STATUS.ACTIVE },
    });
  },

  async delete(id: number){
    return prisma.season.delete({
      where : { id : id }
    })
  }
};