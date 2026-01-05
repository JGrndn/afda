import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryOptions } from '@/lib/hooks/query';
import { toMembershipDTO, toMembershipsDTO, toMembershipWithDetailsDTO, toMembershipSummaryDTO } from '@/lib/mappers/membership.mapper';
import { MembershipDTO, MembershipWithDetailsDTO, MembershipSummaryDTO } from '@/lib/dto/membership.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateMembershipInput, UpdateMembershipInput } from '@/lib/schemas/membership.input';
import { MembershipStatus } from '@/lib/domain/membership.status';

export const membershipService = {
  async getAll(
    options?: QueryOptions<Prisma.MembershipOrderByWithRelationInput> & {
      includeDetails?: boolean;
      includeSummary?: boolean;
      memberId?: number;
      seasonId?: number;
      status?: MembershipStatus;
      familyId?: number;
    }
  ): Promise<MembershipDTO[] | MembershipWithDetailsDTO[] | MembershipSummaryDTO[]> {
    const {
      filters = {},
      orderBy,
      includeDetails,
      includeSummary,
      memberId,
      seasonId,
      status,
      familyId,
    } = options || {};

    const { includeDetails: _, includeSummary: __, ...prismaFilters } = filters as any;

    const where: Prisma.MembershipWhereInput = {
      ...prismaFilters,
    };

    if (memberId !== undefined) {
      where.memberId = memberId;
    }

    if (seasonId !== undefined) {
      where.seasonId = seasonId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (familyId !== undefined) {
      where.member = {
        familyId,
      };
    }

    const finalOrderBy = orderBy || { membershipDate: 'desc' as const };

    if (includeSummary) {
      const memberships = await prisma.membership.findMany({
        where,
        orderBy: finalOrderBy,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              family: { select: { name: true } },
              registrations: {
                where: {
                  seasonId: seasonId,
                },
                select: {
                  totalPrice: true,
                  quantity: true,
                },
              },
            },
          },
          season: { select: { startYear: true, endYear: true } },
        },
      });
      return memberships.map(toMembershipSummaryDTO);
    }

    if (includeDetails) {
      const memberships = await prisma.membership.findMany({
        where,
        orderBy: finalOrderBy,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              family: { select: { name: true } },
            },
          },
          season: { select: { startYear: true, endYear: true } },
          _count: {
            select: {
              member: {
                select: {
                  registrations: {
                    where: {
                      seasonId: seasonId,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Correction pour le count
      const membershipsWithCount = await Promise.all(
        memberships.map(async (m) => {
          const count = await prisma.registration.count({
            where: {
              memberId: m.memberId,
              seasonId: m.seasonId,
            },
          });
          return {
            ...m,
            _count: { registrations: count },
          };
        })
      );

      return membershipsWithCount.map(toMembershipWithDetailsDTO);
    }

    const memberships = await prisma.membership.findMany({
      where,
      orderBy: finalOrderBy,
    });

    return toMembershipsDTO(memberships);
  },

  async getById(id: number): Promise<MembershipDTO | null> {
    const membership = await prisma.membership.findUnique({
      where: { id },
    });
    return membership ? toMembershipDTO(membership) : null;
  },

  async getByIdWithDetails(id: number): Promise<MembershipWithDetailsDTO | null> {
    const membership = await prisma.membership.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            family: { select: { name: true } },
          },
        },
        season: { select: { startYear: true, endYear: true } },
      },
    });

    if (!membership) return null;

    const workshopsCount = await prisma.registration.count({
      where: {
        memberId: membership.memberId,
        seasonId: membership.seasonId,
      },
    });

    return toMembershipWithDetailsDTO({
      ...membership,
      _count: { registrations: workshopsCount },
    });
  },

  async getByMemberAndSeason(memberId: number, seasonId: number): Promise<MembershipDTO | null> {
    const membership = await prisma.membership.findUnique({
      where: {
        memberId_seasonId: {
          memberId,
          seasonId,
        },
      },
    });
    return membership ? toMembershipDTO(membership) : null;
  },

  async create(input: CreateMembershipInput): Promise<MembershipDTO> {
    try {
      // Vérifier si une membership existe déjà
      const existing = await prisma.membership.findUnique({
        where: {
          memberId_seasonId: {
            memberId: input.memberId,
            seasonId: input.seasonId,
          },
        },
      });

      if (existing) {
        throw new DomainError(
          'Une adhésion existe déjà pour ce membre et cette saison',
          'MEMBERSHIP_ALREADY_EXISTS'
        );
      }

      // Si familyOrder n'est pas fourni, calculer automatiquement
      let familyOrder = input.familyOrder || 1;

      if (!input.familyOrder) {
        const member = await prisma.member.findUnique({
          where: { id: input.memberId },
        });

        if (member?.familyId) {
          // Compter les adhésions de la famille pour cette saison
          const familyMembershipsCount = await prisma.membership.count({
            where: {
              seasonId: input.seasonId,
              member: {
                familyId: member.familyId,
              },
            },
          });

          familyOrder = familyMembershipsCount + 1;
        }
      }

      const data = {
        ...input,
        familyOrder,
        amount: new Prisma.Decimal(input.amount),
        membershipDate: input.membershipDate || new Date(),
      };

      const result = await prisma.membership.create({ data });
      return toMembershipDTO(result);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      const e = error as any;
      if (e?.code === 'P2002') {
        throw new DomainError(
          'Une adhésion existe déjà pour ce membre et cette saison',
          'MEMBERSHIP_ALREADY_EXISTS'
        );
      }
      if (e?.code === 'P2003') {
        throw new DomainError('Membre ou saison introuvable', 'MEMBER_OR_SEASON_NOT_FOUND');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateMembershipInput): Promise<MembershipDTO> {
    try {
      const data = {
        ...(input.familyOrder !== undefined && { familyOrder: input.familyOrder }),
        ...(input.amount !== undefined && { amount: new Prisma.Decimal(input.amount) }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.membershipDate !== undefined && { membershipDate: input.membershipDate }),
      };

      const result = await prisma.membership.update({
        where: { id },
        data,
      });
      return toMembershipDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Adhésion introuvable', 'MEMBERSHIP_NOT_FOUND');
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await prisma.membership.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Adhésion introuvable', 'MEMBERSHIP_NOT_FOUND');
      }
      throw error;
    }
  },
};