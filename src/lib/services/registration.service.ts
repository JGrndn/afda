import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { toRegistrationDTO } from '@/lib/mappers/registration.mapper';
import { RegistrationDTO } from '@/lib/dto/registration.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateRegistrationInput, UpdateRegistrationInput } from '@/lib/schemas/registration.input';

export const registrationService = {
  async create(input: CreateRegistrationInput): Promise<RegistrationDTO> {
    try {
      // Vérifier que la membership existe
      const membership = await prisma.membership.findUnique({
        where: {
          memberId_seasonId: {
            memberId: input.memberId,
            seasonId: input.seasonId,
          },
        },
      });

      if (!membership) {
        throw new DomainError(
          'Le membre doit d\'abord adhérer à l\'association pour cette saison',
          'MEMBERSHIP_REQUIRED'
        );
      }

      // Vérifier les contraintes de l'atelier
      const workshop = await prisma.workshop.findUnique({
        where: { id: input.workshopId },
      });

      if (!workshop) {
        throw new DomainError('Atelier introuvable', 'WORKSHOP_NOT_FOUND');
      }

      if (!workshop.allowMultiple && input.quantity > 1) {
        throw new DomainError(
          "Cet atelier n'autorise pas les inscriptions multiples",
          'MULTIPLE_NOT_ALLOWED'
        );
      }

      if (
        workshop.allowMultiple &&
        workshop.maxPerMember &&
        input.quantity > workshop.maxPerMember
      ) {
        throw new DomainError(
          `Le nombre maximum d'inscriptions pour cet atelier est ${workshop.maxPerMember}`,
          'MAX_PER_MEMBER_EXCEEDED'
        );
      }

      const data = {
        ...input,
        totalPrice: new Prisma.Decimal(input.totalPrice),
        discountPercent: new Prisma.Decimal(input.discountPercent),
        registrationDate: input.registrationDate || new Date(),
      };

      const result = await prisma.registration.create({ data });
      return toRegistrationDTO(result);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      const e = error as any;
      if (e?.code === 'P2002') {
        throw new DomainError(
          'Ce membre est déjà inscrit à cet atelier pour cette saison',
          'WORKSHOP_REGISTRATION_ALREADY_EXISTS'
        );
      }
      if (e?.code === 'P2003') {
        throw new DomainError(
          'Membre, saison ou atelier introuvable',
          'MEMBER_SEASON_OR_WORKSHOP_NOT_FOUND'
        );
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateRegistrationInput): Promise<RegistrationDTO> {
    try {
      if (input.quantity !== undefined) {
        const existing = await prisma.registration.findUnique({
          where: { id },
          include: { workshop: true },
        });

        if (!existing) {
          throw new DomainError(
            'Inscription à l\'atelier introuvable',
            'WORKSHOP_REGISTRATION_NOT_FOUND'
          );
        }

        if (!existing.workshop.allowMultiple && input.quantity > 1) {
          throw new DomainError(
            "Cet atelier n'autorise pas les inscriptions multiples",
            'MULTIPLE_NOT_ALLOWED'
          );
        }

        if (
          existing.workshop.allowMultiple &&
          existing.workshop.maxPerMember &&
          input.quantity > existing.workshop.maxPerMember
        ) {
          throw new DomainError(
            `Le nombre maximum d'inscriptions pour cet atelier est ${existing.workshop.maxPerMember}`,
            'MAX_PER_MEMBER_EXCEEDED'
          );
        }
      }

      const data = {
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.totalPrice !== undefined && {
          totalPrice: new Prisma.Decimal(input.totalPrice),
        }),
        ...(input.discountPercent !== undefined && {
          discountPercent: new Prisma.Decimal(input.discountPercent),
        }),
        ...(input.registrationDate !== undefined && {
          registrationDate: input.registrationDate,
        }),
      };

      const result = await prisma.registration.update({
        where: { id },
        data,
      });
      return toRegistrationDTO(result);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError(
          'Inscription à l\'atelier introuvable',
          'REGISTRATION_NOT_FOUND'
        );
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await prisma.registration.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError(
          'Inscription à l\'atelier introuvable',
          'REGISTRATION_NOT_FOUND'
        );
      }
      throw error;
    }
  },
};