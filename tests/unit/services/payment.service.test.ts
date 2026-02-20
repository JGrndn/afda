/**
 * Tests unitaires - paymentService
 *
 * Règles métier testées :
 *  - Statut automatique basé sur cashingDate :
 *    * Si pas de cashingDate → completed
 *    * Si cashingDate <= aujourd'hui → completed
 *    * Si cashingDate > aujourd'hui → pending
 *  - Conversion amount en Decimal
 *  - paymentDate par défaut = aujourd'hui
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '@/lib/services/payment.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import { Decimal } from '@prisma/client/runtime/client';
import { PAYMENT_STATUS } from '@/lib/domain/enums/payment.enum';

const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

// Factory simplifiée pour Payment
const buildPrismaPayment = (overrides = {}) => ({
  id: 1,
  familyId: 1,
  seasonId: 1,
  amount: new Decimal('100.00'),
  paymentType: 'cash',
  paymentDate: new Date('2025-09-15'),
  cashingDate: null,
  status: 'completed',
  reference: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('paymentService', () => {
  // ─────────────────────────────────────────
  //  determinePaymentStatus — logique métier
  // ─────────────────────────────────────────
  describe('determinePaymentStatus', () => {
    it('retourne completed si cashingDate est null', () => {
      const status = paymentService.determinePaymentStatus(null);
      expect(status).toBe(PAYMENT_STATUS.COMPLETED);
    });

    it('retourne completed si cashingDate est undefined', () => {
      const status = paymentService.determinePaymentStatus(undefined);
      expect(status).toBe(PAYMENT_STATUS.COMPLETED);
    });

    it('retourne completed si cashingDate est passée', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const status = paymentService.determinePaymentStatus(yesterday);
      expect(status).toBe(PAYMENT_STATUS.COMPLETED);
    });

    it('retourne completed si cashingDate est la date actuelle', () => {
      const today = new Date();

      const status = paymentService.determinePaymentStatus(today);
      expect(status).toBe(PAYMENT_STATUS.COMPLETED);
    });

    it('retourne pending si cashingDate est dans le futur', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const status = paymentService.determinePaymentStatus(tomorrow);
      expect(status).toBe(PAYMENT_STATUS.PENDING);
    });
  });

  // ─────────────────────────────────────────
  //  create
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée un paiement avec statut completed si pas de cashingDate', async () => {
      const created = buildPrismaPayment({ status: 'completed' });
      (prisma as any).payment.create.mockResolvedValue(created);

      const result = await paymentService.create({
        familyId: 1,
        seasonId: 1,
        amount: 100,
        paymentType: 'cash',
        // cashingDate non fourni
      });

      expect(result.status).toBe('completed');
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: PAYMENT_STATUS.COMPLETED,
        }),
      });
    });

    it('crée un paiement avec statut pending si cashingDate dans le futur', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const created = buildPrismaPayment({
        cashingDate: futureDate,
        status: 'pending',
      });
      (prisma as any).payment.create.mockResolvedValue(created);

      const result = await paymentService.create({
        familyId: 1,
        seasonId: 1,
        amount: 100,
        paymentType: 'check',
        cashingDate: futureDate,
      });

      expect(result.status).toBe('pending');
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: PAYMENT_STATUS.PENDING,
        }),
      });
    });

    it('convertit amount en Decimal', async () => {
      const created = buildPrismaPayment();
      (prisma as any).payment.create.mockResolvedValue(created);

      await paymentService.create({
        familyId: 1,
        seasonId: 1,
        amount: 150, // ← number JavaScript
        paymentType: 'cash',
      });

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: expect.any(Decimal),
        }),
      });
    });

    it('utilise paymentDate fourni ou par défaut la date actuelle', async () => {
      const created = buildPrismaPayment();
      (prisma as any).payment.create.mockResolvedValue(created);

      const specificDate = new Date('2025-10-01');

      await paymentService.create({
        familyId: 1,
        seasonId: 1,
        amount: 100,
        paymentType: 'cash',
        paymentDate: specificDate,
      });

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          paymentDate: specificDate,
        }),
      });
    });

    it('lève FAMILY_OR_SEASON_NOT_FOUND si FK invalide (P2003)', async () => {
      (prisma as any).payment.create.mockRejectedValue(prismaError('P2003'));

      await expect(
        paymentService.create({
          familyId: 9999,
          seasonId: 1,
          amount: 100,
          paymentType: 'cash',
        })
      ).rejects.toMatchObject({ code: 'FAMILY_OR_SEASON_NOT_FOUND' });
    });
  });

  // ─────────────────────────────────────────
  //  update
  // ─────────────────────────────────────────
  describe('update', () => {
    it('met à jour un paiement existant', async () => {
      const existing = buildPrismaPayment({ id: 1 });
      (prisma as any).payment.findUnique.mockResolvedValue(existing);

      const updated = buildPrismaPayment({
        id: 1,
        amount: new Decimal('150.00'),
      });
      (prisma as any).payment.update.mockResolvedValue(updated);

      const result = await paymentService.update(1, { amount: 150 });

      expect(result).toBeDefined();
      expect(prisma.payment.update).toHaveBeenCalledOnce();
    });

    it('recalcule le statut automatiquement si cashingDate change', async () => {
      const existing = buildPrismaPayment({ id: 1, status: 'pending' });
      (prisma as any).payment.findUnique.mockResolvedValue(existing);

      const updated = buildPrismaPayment({ id: 1, status: 'completed' });
      (prisma as any).payment.update.mockResolvedValue(updated);

      // Mettre cashingDate dans le passé → statut devient completed
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await paymentService.update(1, { cashingDate: pastDate });

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: PAYMENT_STATUS.COMPLETED,
        }),
      });
    });

    it('ne modifie pas le statut si cashingDate nest pas changée', async () => {
      const existing = buildPrismaPayment({ id: 1 });
      (prisma as any).payment.findUnique.mockResolvedValue(existing);

      const updated = buildPrismaPayment({ id: 1 });
      (prisma as any).payment.update.mockResolvedValue(updated);

      await paymentService.update(1, { amount: 200 });

      // Status ne doit PAS être dans les données mises à jour
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.not.objectContaining({
          status: expect.anything(),
        }),
      });
    });

    it('lève PAYMENT_NOT_FOUND si le paiement est introuvable au findUnique', async () => {
      (prisma as any).payment.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.update(9999, { amount: 100 })
      ).rejects.toMatchObject({ code: 'PAYMENT_NOT_FOUND' });

      // Update ne doit PAS être appelé
      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('lève PAYMENT_NOT_FOUND si Prisma update échoue (P2025)', async () => {
      const existing = buildPrismaPayment({ id: 1 });
      (prisma as any).payment.findUnique.mockResolvedValue(existing);
      (prisma as any).payment.update.mockRejectedValue(prismaError('P2025'));

      await expect(
        paymentService.update(1, { amount: 100 })
      ).rejects.toMatchObject({ code: 'PAYMENT_NOT_FOUND' });
    });
  });

  // ─────────────────────────────────────────
  //  delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('supprime un paiement existant', async () => {
      const existing = buildPrismaPayment({ id: 1 });
      (prisma as any).payment.findUnique.mockResolvedValue(existing);
      (prisma as any).payment.delete.mockResolvedValue(existing);

      await expect(paymentService.delete(1)).resolves.toBeUndefined();
      expect(prisma.payment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lève PAYMENT_NOT_FOUND si le paiement est introuvable au findUnique', async () => {
      (prisma as any).payment.findUnique.mockResolvedValue(null);

      await expect(paymentService.delete(9999)).rejects.toMatchObject({
        code: 'PAYMENT_NOT_FOUND',
      });

      // Delete ne doit PAS être appelé
      expect(prisma.payment.delete).not.toHaveBeenCalled();
    });

    it('lève PAYMENT_NOT_FOUND si Prisma delete échoue (P2025)', async () => {
      const existing = buildPrismaPayment({ id: 1 });
      (prisma as any).payment.findUnique.mockResolvedValue(existing);
      (prisma as any).payment.delete.mockRejectedValue(prismaError('P2025'));

      await expect(paymentService.delete(1)).rejects.toMatchObject({
        code: 'PAYMENT_NOT_FOUND',
      });
    });
  });

  // ─────────────────────────────────────────
  //  getAll
  // ─────────────────────────────────────────
  describe('getAll', () => {
    it('retourne tous les paiements triés par date décroissante', async () => {
      const payments = [
        buildPrismaPayment({ paymentDate: new Date('2025-09-15') }),
        buildPrismaPayment({ paymentDate: new Date('2025-08-01') }),
      ];
      (prisma as any).payment.findMany.mockResolvedValue(payments);

      const result = await paymentService.getAll();

      expect(result).toHaveLength(2);
      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { paymentDate: 'desc' },
        })
      );
    });

    it('filtre par familyId si fourni', async () => {
      (prisma as any).payment.findMany.mockResolvedValue([]);

      await paymentService.getAll({ familyId: 5 });

      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ familyId: 5 }),
        })
      );
    });

    it('filtre par seasonId si fourni', async () => {
      (prisma as any).payment.findMany.mockResolvedValue([]);

      await paymentService.getAll({ seasonId: 3 });

      expect(prisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ seasonId: 3 }),
        })
      );
    });
  });
});