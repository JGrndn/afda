import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryOptions } from '@/lib/hooks/query';
import { toFamilyDTO, toFamiliesDTO, toFamilyWithFullDetailsDTO } from '@/lib/mappers/family.mapper';
import { FamilyDTO } from '@/lib/dto/family.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateFamilyInput, UpdateFamilyInput } from '@/lib/schemas/family.input';

export const familyService = {
  async getAll(
    options?: QueryOptions<Prisma.FamilyOrderByWithRelationInput> & {
    }
  ): Promise<FamilyDTO[]> {
    const { filters = {}, orderBy } = options || {};
    
    const where: Prisma.FamilyWhereInput = {
      ...filters,
    };  
    const finalOrderBy = orderBy || { name: 'asc' as const };
    const families = await prisma.family.findMany({
      where,
      orderBy: finalOrderBy,
    });
    
    return toFamiliesDTO(families);
  },

  async getById(id: number): Promise<FamilyDTO | null> {
    const family = await prisma.family.findUnique({
      where: { id },
      include:{
        members:true
      }
    });
    return family ? toFamilyWithFullDetailsDTO(family) : null;
  },

  async create(input: CreateFamilyInput): Promise<FamilyDTO> {
    try {
      const result = await prisma.family.create({
        data: input,
      });
      return toFamilyDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2002') {
        throw new DomainError('Une famille avec ce nom existe déjà', 'FAMILY_ALREADY_EXISTS');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateFamilyInput): Promise<FamilyDTO> {
    try {
      const result = await prisma.family.update({
        where: { id },
        data: input,
      });
      return toFamilyDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Famille introuvable', 'FAMILY_NOT_FOUND');
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await prisma.family.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Famille introuvable', 'FAMILY_NOT_FOUND');
      }
      throw error;
    }
  },
};