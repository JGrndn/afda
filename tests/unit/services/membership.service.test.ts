/**
 * Tests unitaires - membershipService
 *
 * Règles métier testées :
 *  - Un membre ne peut avoir qu'UNE adhésion par saison (unicité)
 *  - familyOrder est calculé automatiquement si non fourni
 *  - Les erreurs Prisma sont transformées en DomainError
 */

import { describe, it, expect, vi } from 'vitest';
import { membershipService } from '@/lib/services/membership.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import {
  buildPrismaMembership,
  buildPrismaMember,
} from '../../helpers/factories';
import { Decimal } from '@prisma/client/runtime/client';

const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

describe('membershipService', () => {
  // ─────────────────────────────────────────
  //  create
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée une adhésion avec des données valides', async () => {
      // Setup : pas d'adhésion existante
      (prisma as any).membership.findUnique.mockResolvedValue(null);
      
      // Pas d'autre membre dans la famille pour cette saison
      (prisma as any).membership.findMany.mockResolvedValue([]);
      
      const created = buildPrismaMembership({
        memberId: 1,
        seasonId: 1,
        familyOrder: 1,
        amount: new Decimal('120.00'),
        status: 'pending',
      });
      (prisma as any).membership.create.mockResolvedValue(created);

      const result = await membershipService.create({
        memberId: 1,
        seasonId: 1,
        amount: 120,
        status: 'pending',
        familyOrder: 0
      });

      expect(result).toBeDefined();
      expect(result.memberId).toBe(1);
      expect(result.seasonId).toBe(1);
      expect(prisma.membership.create).toHaveBeenCalledOnce();
    });

    it('lève MEMBERSHIP_ALREADY_EXISTS si une adhésion existe déjà', async () => {
      // Adhésion existante
      const existing = buildPrismaMembership({ memberId: 1, seasonId: 1 });
      (prisma as any).membership.findUnique.mockResolvedValue(existing);

      await expect(
        membershipService.create({
          memberId: 1,
          seasonId: 1,
          amount: 120,
          familyOrder: 0,
          status: 'pending'
        })
      ).rejects.toMatchObject({ code: 'MEMBERSHIP_ALREADY_EXISTS' });

      // Ne doit PAS essayer de créer
      expect(prisma.membership.create).not.toHaveBeenCalled();
    });

    it('calcule automatiquement familyOrder si non fourni', async () => {
      (prisma as any).membership.findUnique.mockResolvedValue(null);

      // Simuler : le membre a familyId = 5
      const member = buildPrismaMember({ id: 1, familyId: 5 });
      (prisma as any).member.findUnique.mockResolvedValue(member);

      // Il existe déjà 2 adhésions pour cette famille/saison
      const existingMemberships = [
        buildPrismaMembership({ familyOrder: 1 }),
        buildPrismaMembership({ familyOrder: 2 }),
      ];
      (prisma as any).membership.findMany.mockResolvedValue(existingMemberships);

      const created = buildPrismaMembership({ familyOrder: 3 });
      (prisma as any).membership.create.mockResolvedValue(created);

      const result = await membershipService.create({
        memberId: 1,
        seasonId: 1,
        amount: 120,
        familyOrder: 0,
        status: 'pending'
      });

      // Devrait être calculé à 3 (max des existants + 1)
      expect(prisma.membership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            familyOrder: 3,
          }),
        })
      );
    });

    it('utilise familyOrder fourni par lutilisateur', async () => {
      (prisma as any).membership.findUnique.mockResolvedValue(null);
      (prisma as any).membership.findMany.mockResolvedValue([]);

      const created = buildPrismaMembership({ familyOrder: 5 });
      (prisma as any).membership.create.mockResolvedValue(created);

      await membershipService.create({
        memberId: 1,
        seasonId: 1,
        amount: 120,
        familyOrder: 5,
        status: 'pending'
      });

      expect(prisma.membership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            familyOrder: 5,
          }),
        })
      );
    });

    it('lève MEMBER_NOT_FOUND si le membre est introuvable (P2003)', async () => {
      (prisma as any).membership.findUnique.mockResolvedValue(null);
      (prisma as any).membership.findMany.mockResolvedValue([]);
      (prisma as any).membership.create.mockRejectedValue(prismaError('P2003'));

      await expect(
        membershipService.create({
          memberId: 9999,
          seasonId: 1,
          amount: 120,
          familyOrder: 0,
          status: 'pending'
        })
      ).rejects.toMatchObject({ code: 'MEMBER_OR_SEASON_NOT_FOUND' });
    });
  });

  // ─────────────────────────────────────────
  //  update
  // ─────────────────────────────────────────
  describe('update', () => {
    it('met à jour une adhésion existante', async () => {
      const updated = buildPrismaMembership({
        id: 1,
        status: 'completed',
      });
      (prisma as any).membership.update.mockResolvedValue(updated);

      const result = await membershipService.update(1, { status: 'completed' });

      expect(result.status).toBe('completed');
      expect(prisma.membership.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'completed' }),
      });
    });

    it('lève MEMBERSHIP_NOT_FOUND si ladhésion est introuvable (P2025)', async () => {
      (prisma as any).membership.update.mockRejectedValue(prismaError('P2025'));

      await expect(
        membershipService.update(9999, { status: 'completed' })
      ).rejects.toMatchObject({ code: 'MEMBERSHIP_NOT_FOUND' });
    });

    it('convertit amount en Decimal si fourni', async () => {
      const updated = buildPrismaMembership({ amount: new Decimal('150.00') });
      (prisma as any).membership.update.mockResolvedValue(updated);

      await membershipService.update(1, { amount: 150 });

      expect(prisma.membership.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: expect.any(Decimal),
          }),
        })
      );
    });
  });

  // ─────────────────────────────────────────
  //  delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('supprime une adhésion existante', async () => {
      (prisma as any).membership.delete.mockResolvedValue(
        buildPrismaMembership()
      );

      await expect(membershipService.delete(1)).resolves.toBeUndefined();
      expect(prisma.membership.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lève MEMBERSHIP_NOT_FOUND si ladhésion est introuvable (P2025)', async () => {
      (prisma as any).membership.delete.mockRejectedValue(prismaError('P2025'));

      await expect(membershipService.delete(9999)).rejects.toMatchObject({
        code: 'MEMBERSHIP_NOT_FOUND',
      });
    });
  });

  // ─────────────────────────────────────────
  //  getAll — filtres
  // ─────────────────────────────────────────
  describe('getAll', () => {
    it('retourne toutes les adhésions triées par date décroissante', async () => {
      const memberships = [
        buildPrismaMembership({ membershipDate: new Date('2025-09-01') }),
        buildPrismaMembership({ membershipDate: new Date('2025-08-01') }),
      ];
      (prisma as any).membership.findMany.mockResolvedValue(memberships);

      const result = await membershipService.getAll();

      expect(result).toHaveLength(2);
      expect(prisma.membership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { membershipDate: 'desc' },
        })
      );
    });

    it('filtre par seasonId si fourni', async () => {
      (prisma as any).membership.findMany.mockResolvedValue([]);

      await membershipService.getAll({ seasonId: 3 });

      expect(prisma.membership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ seasonId: 3 }),
        })
      );
    });

    it('filtre par liste de memberIds', async () => {
      (prisma as any).membership.findMany.mockResolvedValue([]);

      await membershipService.getAll({ memberIds: [1, 2, 5] });

      expect(prisma.membership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            memberId: { in: [1, 2, 5] },
          }),
        })
      );
    });

    it('filtre par status', async () => {
      (prisma as any).membership.findMany.mockResolvedValue([]);

      await membershipService.getAll({ status: 'completed' });

      expect(prisma.membership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'completed' }),
        })
      );
    });
  });
});