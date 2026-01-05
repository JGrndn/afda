import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryOptions } from '@/lib/hooks/query';
import { toMemberDTO, toMemberWithFamilyNameDTO, toMemberWithFullDetailsDTO } from '@/lib/mappers/member.mapper';
import { MemberDTO, MemberWithFamilyNameDTO, MemberWithFullDetailsDTO } from '@/lib/dto/member.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateMemberInput, UpdateMemberInput } from '@/lib/schemas/member.input';

export const memberService = {
  async getAll(
    options?: QueryOptions<Prisma.MemberOrderByWithRelationInput> & {
      search?: string;
    }
  ): Promise<MemberWithFamilyNameDTO[]> {
    const { filters = {}, orderBy, search } = options || {};
  
    const where: Prisma.MemberWhereInput = {
      ...filters,
    };
    if (search) {
      where.OR = [
        { lastName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const finalOrderBy = orderBy || { lastName: 'asc' as const, firstName: 'asc' as const };
    const members : PrismaMemberWithFamily[] = await prisma.member.findMany({
      where,
      orderBy: finalOrderBy,
      include: {
        family: true,
      },
    });
    return members.map(toMemberWithFamilyNameDTO);
    
  },

  async getById(id: number): Promise<MemberWithFullDetailsDTO | null> {
    const member: PrismaMemberWithFullDetails | null = await prisma.member.findUnique({
      where: { id },
      include: {
        family: true,
        memberships: {
          orderBy: {
            season: {startYear: 'desc'}
          },
          include: {
            season:true
          }
        },
        registrations: {
          include:{
            workshop:true
          }
        }
      }
    });
    return member ? toMemberWithFullDetailsDTO(member) : null;
  },

  async create(input: CreateMemberInput): Promise<MemberDTO> {
    try {
      // Validation métier : si mineur, vérifier qu'au moins une info tuteur est présente
      if (input.isMinor && !input.guardianLastName && !input.guardianFirstName) {
        throw new DomainError(
          'Les informations du tuteur sont requises pour un mineur',
          'GUARDIAN_INFO_REQUIRED'
        );
      }

      const result = await prisma.member.create({
        data: input,
      });
      return toMemberDTO(result);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      const e = error as any;
      if (e?.code === 'P2003') {
        throw new DomainError('Famille introuvable', 'FAMILY_NOT_FOUND');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateMemberInput): Promise<MemberDTO> {
    try {
      const result = await prisma.member.update({
        where: { id },
        data: input,
      });
      return toMemberDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Membre introuvable', 'MEMBER_NOT_FOUND');
      }
      if (e?.code === 'P2003') {
        throw new DomainError('Famille introuvable', 'FAMILY_NOT_FOUND');
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await prisma.member.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Membre introuvable', 'MEMBER_NOT_FOUND');
      }
      throw error;
    }
  },
};

export type PrismaMemberWithFamily =
  Prisma.MemberGetPayload<{
    include: {
      family: true
    };
  }>;

export type PrismaMemberWithFullDetails =
  Prisma.MemberGetPayload<{
    include: {
      family: true,
      memberships: {
        include: {
          season : true
        }
      },
      registrations: {
        include:{
          workshop:true
        }
      }
    };
  }>;