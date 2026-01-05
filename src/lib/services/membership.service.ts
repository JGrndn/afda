import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { toMembershipDTO } from '@/lib/mappers/membership.mapper';
import { MembershipDTO } from '@/lib/dto/membership.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateMembershipInput, UpdateMembershipInput } from '@/lib/schemas/membership.input';


export const membershipService = {
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