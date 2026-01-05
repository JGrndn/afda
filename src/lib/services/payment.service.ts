import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryOptions } from '@/lib/hooks/query';
import {
  toPaymentDTO,
  toPaymentsDTO,
  toPaymentWithDetailsDTO,
} from '@/lib/mappers/payment.mapper';
import {
  PaymentDTO,
  PaymentWithDetailsDTO,
  FamilyPaymentSummaryDTO,
} from '@/lib/dto/payment.dto';
import { DomainError } from '../errors/domain-error';
import { CreatePaymentInput, UpdatePaymentInput } from '@/lib/schemas/payment.input';
import { PaymentStatus } from '@/lib/domain/payment.enum';
import { MEMBERSHIP_STATUS } from '@/lib/domain/membership.enum';

export const paymentService = {
  async getAll(
    options?: QueryOptions<Prisma.PaymentOrderByWithRelationInput> & {
      includeDetails?: boolean;
      familyId?: number;
      seasonId?: number;
      status?: PaymentStatus;
    }
  ): Promise<PaymentDTO[] | PaymentWithDetailsDTO[]> {
    const { filters = {}, orderBy, includeDetails, familyId, seasonId, status } = options || {};

    const { includeDetails: _, ...prismaFilters } = filters as any;

    const where: Prisma.PaymentWhereInput = {
      ...prismaFilters,
    };

    if (familyId !== undefined) {
      where.familyId = familyId;
    }

    if (seasonId !== undefined) {
      where.seasonId = seasonId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    const finalOrderBy = orderBy || { paymentDate: 'desc' as const };

    if (includeDetails) {
      const payments = await prisma.payment.findMany({
        where,
        orderBy: finalOrderBy,
        include: {
          family: { select: { name: true } },
          season: { select: { startYear: true, endYear: true } },
        },
      });
      return payments.map(toPaymentWithDetailsDTO);
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: finalOrderBy,
    });

    return toPaymentsDTO(payments);
  },

  async getById(id: number): Promise<PaymentDTO | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });
    return payment ? toPaymentDTO(payment) : null;
  },

  async getByIdWithDetails(id: number): Promise<PaymentWithDetailsDTO | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        family: { select: { name: true } },
        season: { select: { startYear: true, endYear: true } },
      },
    });
    return payment ? toPaymentWithDetailsDTO(payment) : null;
  },

  /**
   * Calcule le montant total dû par une famille pour une saison
   * (somme des memberships + registrations)
   */
  async calculateFamilyBalance(familyId: number, seasonId: number): Promise<FamilyPaymentSummaryDTO> {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new DomainError('Famille introuvable', 'FAMILY_NOT_FOUND');
    }

    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new DomainError('Saison introuvable', 'SEASON_NOT_FOUND');
    }

    // Récupérer tous les membres de la famille
    const familyMembers = await prisma.member.findMany({
      where: { familyId },
      select: { id: true },
    });

    const memberIds = familyMembers.map((m) => m.id);

    // Calculer le montant total des memberships
    const memberships = await prisma.membership.findMany({
      where: {
        memberId: { in: memberIds },
        seasonId,
      },
    });

    const totalMemberships = memberships.reduce(
      (sum, m) => sum + m.amount.toNumber(),
      0
    );

    // Calculer le montant total des registrations
    const registrations = await prisma.registration.findMany({
      where: {
        memberId: { in: memberIds },
        seasonId,
      },
    });

    const totalRegistrations = registrations.reduce(
      (sum, r) => sum + r.totalPrice.toNumber() * r.quantity,
      0
    );

    const totalDue = totalMemberships + totalRegistrations;

    // Calculer le montant total payé (seulement les paiements completed)
    const payments = await prisma.payment.findMany({
      where: {
        familyId,
        seasonId,
        status: 'completed',
      },
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);

    return {
      familyId,
      familyName: family.name,
      seasonId,
      seasonYear: `${season.startYear}-${season.endYear}`,
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
      paymentsCount: payments.length,
      isFullyPaid: totalPaid >= totalDue,
    };
  },

  /**
   * Valide automatiquement les memberships si le montant payé >= montant dû
   */
  async validateMembershipsIfFullyPaid(familyId: number, seasonId: number): Promise<void> {
    const balance = await this.calculateFamilyBalance(familyId, seasonId);

    if (balance.isFullyPaid) {
      // Récupérer tous les membres de la famille
      const familyMembers = await prisma.member.findMany({
        where: { familyId },
        select: { id: true },
      });

      const memberIds = familyMembers.map((m) => m.id);

      // Mettre à jour tous les memberships de la famille pour cette saison
      await prisma.membership.updateMany({
        where: {
          memberId: { in: memberIds },
          seasonId,
          status: { in: [MEMBERSHIP_STATUS.PENDING, MEMBERSHIP_STATUS.PAID] },
        },
        data: {
          status: 'validated',
        },
      });
    }
  },

  /**
   * Détermine automatiquement le statut d'un paiement selon la cashingDate
   * - Si pas de cashingDate ou cashingDate <= aujourd'hui → completed
   * - Sinon → pending
   */
  determinePaymentStatus(cashingDate: Date | null | undefined): string {
    if (!cashingDate) {
      return 'completed';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cashing = new Date(cashingDate);
    cashing.setHours(0, 0, 0, 0);
    
    return cashing <= today ? 'completed' : 'pending';
  },

  async create(input: CreatePaymentInput): Promise<PaymentDTO> {
    try {
      // Déterminer automatiquement le statut selon la cashingDate
      const autoStatus = this.determinePaymentStatus(input.cashingDate);
      
      const data = {
        ...input,
        amount: new Prisma.Decimal(input.amount),
        paymentDate: input.paymentDate || new Date(),
        status: autoStatus, // Utiliser le statut automatique
      };

      const result = await prisma.payment.create({ data });

      // Si le paiement est completed, vérifier si on peut valider les memberships
      if (result.status === 'completed') {
        await this.validateMembershipsIfFullyPaid(result.familyId, result.seasonId);
      }

      return toPaymentDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2003') {
        throw new DomainError('Famille ou saison introuvable', 'FAMILY_OR_SEASON_NOT_FOUND');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdatePaymentInput): Promise<PaymentDTO> {
    try {
      const existing = await prisma.payment.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new DomainError('Paiement introuvable', 'PAYMENT_NOT_FOUND');
      }

      // Si cashingDate est modifiée, recalculer le statut automatiquement
      let autoStatus: string | undefined;
      if (input.cashingDate !== undefined) {
        autoStatus = this.determinePaymentStatus(input.cashingDate);
      }

      const data = {
        ...(input.amount !== undefined && { amount: new Prisma.Decimal(input.amount) }),
        ...(input.paymentType !== undefined && { paymentType: input.paymentType }),
        ...(input.paymentDate !== undefined && { paymentDate: input.paymentDate }),
        ...(input.cashingDate !== undefined && { cashingDate: input.cashingDate }),
        ...(autoStatus !== undefined && { status: autoStatus }), // Statut auto basé sur cashingDate
        ...(input.reference !== undefined && { reference: input.reference }),
        ...(input.notes !== undefined && { notes: input.notes }),
      };

      const result = await prisma.payment.update({
        where: { id },
        data,
      });

      // Si le statut passe à completed, vérifier si on peut valider les memberships
      if (
        result.status === 'completed' &&
        existing.status !== 'completed'
      ) {
        await this.validateMembershipsIfFullyPaid(result.familyId, result.seasonId);
      }

      return toPaymentDTO(result);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Paiement introuvable', 'PAYMENT_NOT_FOUND');
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        throw new DomainError('Paiement introuvable', 'PAYMENT_NOT_FOUND');
      }

      await prisma.payment.delete({
        where: { id },
      });

      // Après suppression, revérifier le statut des memberships
      if (payment.status === 'completed') {
        await this.validateMembershipsIfFullyPaid(payment.familyId, payment.seasonId);
      }
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Paiement introuvable', 'PAYMENT_NOT_FOUND');
      }
      throw error;
    }
  },
};