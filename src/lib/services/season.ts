import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client'
import { extractScalarFields } from '@/lib/utils';
import { QueryOptions } from '@/lib/hooks/query';

export const seasonService = {
  async getAll(
    options?: QueryOptions<Prisma.SeasonOrderByWithRelationInput> & {
      isActive?: boolean;
    }
  ) {
    const { filters = {}, orderBy, isActive } = options || {};
    
    const where: Prisma.SeasonWhereInput = {
      ...filters,
      ...(isActive !== undefined && { isActive }),
    };
    
    const finalOrderBy = orderBy || { startYear: 'desc' as const };
    
    return prisma.season.findMany({
      where,
      orderBy: finalOrderBy,
    });
  },

  async getById(id: number){
    return prisma.season.findUnique({
      where : { id : id }
    });
  },

  async getActive(){
    return prisma.season.findFirst({
      where : { isActive : true}
    });
  },

  async create(data: Prisma.SeasonCreateInput){
    return prisma.season.create({data});
  },

  async update(id: number, data:Prisma.SeasonUpdateInput){
    if (data.isActive === true){
      // one active season only
      await prisma.season.updateMany({
        where : {
          isActive: true, 
          NOT: { id: id }
        },
        data : { isActive :false }
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
      where : { isActive : true },
      data : { isActive :false },
    });
    return prisma.season.update({
      where : { id : id },
      data : { isActive : true },
    });
  },

  async delete(id: number){
    return prisma.season.delete({
      where : { id : id }
    })
  }
};