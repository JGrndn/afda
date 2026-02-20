/**
 * Tests unitaires - workshopPriceService
 *
 * Règles métier testées :
 *  - Unicité : un seul prix par atelier/saison (workshopId + seasonId)
 *  - Conversion amount en Decimal
 *  - Contraintes FK (workshop et season doivent exister)
 */

import { describe, it, expect, vi } from 'vitest';
import { workshopPriceService } from '@/lib/services/workshopPrice.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import { Decimal } from '@prisma/client/runtime/client';

const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

// Factory simplifiée pour WorkshopPrice
const buildPrismaWorkshopPrice = (overrides = {}) => ({
  id: 1,
  workshopId: 1,
  seasonId: 1,
  amount: new Decimal('130.00'),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('workshopPriceService', () => {
  // ─────────────────────────────────────────
  //  create
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée un prix avec des données valides', async () => {
      const created = buildPrismaWorkshopPrice({
        workshopId: 1,
        seasonId: 2,
        amount: new Decimal('150.00'),
      });
      (prisma as any).workshopPrice.create.mockResolvedValue(created);

      const result = await workshopPriceService.create({
        workshopId: 1,
        seasonId: 2,
        amount: 150,
      });

      expect(result).toBeDefined();
      expect(result.workshopId).toBe(1);
      expect(result.seasonId).toBe(2);
      expect(prisma.workshopPrice.create).toHaveBeenCalledOnce();
    });

    it('convertit amount en Decimal Prisma', async () => {
      const created = buildPrismaWorkshopPrice();
      (prisma as any).workshopPrice.create.mockResolvedValue(created);

      await workshopPriceService.create({
        workshopId: 1,
        seasonId: 1,
        amount: 175, // ← number JavaScript
      });

      expect(prisma.workshopPrice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: expect.any(Decimal),
        }),
      });
    });

    it('lève WORKSHOP_PRICE_ALREADY_EXISTS si le doublon existe (P2002)', async () => {
      (prisma as any).workshopPrice.create.mockRejectedValue(
        prismaError('P2002')
      );

      await expect(
        workshopPriceService.create({
          workshopId: 1,
          seasonId: 1,
          amount: 150,
        })
      ).rejects.toMatchObject({ code: 'WORKSHOP_PRICE_ALREADY_EXISTS' });
    });

    it('lève WORKSHOP_OR_SEASON_NOT_FOUND si FK invalide (P2003)', async () => {
      (prisma as any).workshopPrice.create.mockRejectedValue(
        prismaError('P2003')
      );

      await expect(
        workshopPriceService.create({
          workshopId: 9999,
          seasonId: 1,
          amount: 150,
        })
      ).rejects.toMatchObject({ code: 'WORKSHOP_OR_SEASON_NOT_FOUND' });
    });
  });

  // ─────────────────────────────────────────
  //  update
  // ─────────────────────────────────────────
  describe('update', () => {
    it('met à jour un prix existant', async () => {
      const updated = buildPrismaWorkshopPrice({
        id: 1,
        amount: new Decimal('200.00'),
      });
      (prisma as any).workshopPrice.update.mockResolvedValue(updated);

      const result = await workshopPriceService.update(1, { amount: 200 });

      expect(result).toBeDefined();
      expect(prisma.workshopPrice.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          amount: expect.any(Decimal),
        }),
      });
    });

    it('lève WORKSHOP_PRICE_NOT_FOUND si le prix est introuvable (P2025)', async () => {
      (prisma as any).workshopPrice.update.mockRejectedValue(
        prismaError('P2025')
      );

      await expect(
        workshopPriceService.update(9999, { amount: 200 })
      ).rejects.toMatchObject({ code: 'WORKSHOP_PRICE_NOT_FOUND' });
    });

    it('convertit amount en Decimal', async () => {
      const updated = buildPrismaWorkshopPrice();
      (prisma as any).workshopPrice.update.mockResolvedValue(updated);

      await workshopPriceService.update(1, { amount: 225 });

      expect(prisma.workshopPrice.update).toHaveBeenCalledWith(
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
    it('supprime un prix existant par ID', async () => {
      (prisma as any).workshopPrice.delete.mockResolvedValue(
        buildPrismaWorkshopPrice()
      );

      await expect(workshopPriceService.delete(1)).resolves.toBeUndefined();
      expect(prisma.workshopPrice.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('lève WORKSHOP_PRICE_NOT_FOUND si le prix est introuvable (P2025)', async () => {
      (prisma as any).workshopPrice.delete.mockRejectedValue(
        prismaError('P2025')
      );

      await expect(workshopPriceService.delete(9999)).rejects.toMatchObject({
        code: 'WORKSHOP_PRICE_NOT_FOUND',
      });
    });
  });

  // ─────────────────────────────────────────
  //  deleteByWorkshopAndSeason
  // ─────────────────────────────────────────
  describe('deleteByWorkshopAndSeason', () => {
    it('supprime un prix par la clé composite (workshopId + seasonId)', async () => {
      (prisma as any).workshopPrice.delete.mockResolvedValue(
        buildPrismaWorkshopPrice()
      );

      await expect(
        workshopPriceService.deleteByWorkshopAndSeason(1, 2)
      ).resolves.toBeUndefined();

      expect(prisma.workshopPrice.delete).toHaveBeenCalledWith({
        where: {
          workshopId_seasonId: {
            workshopId: 1,
            seasonId: 2,
          },
        },
      });
    });

    it('lève WORKSHOP_PRICE_NOT_FOUND si pas de prix pour cette combinaison', async () => {
      (prisma as any).workshopPrice.delete.mockRejectedValue(
        prismaError('P2025')
      );

      await expect(
        workshopPriceService.deleteByWorkshopAndSeason(9999, 9999)
      ).rejects.toMatchObject({ code: 'WORKSHOP_PRICE_NOT_FOUND' });
    });
  });

  // ─────────────────────────────────────────
  //  getAllForSeason
  // ─────────────────────────────────────────
  describe('getAllForSeason', () => {
    it('retourne tous les prix pour une saison donnée', async () => {
      const prices = [
        {
          ...buildPrismaWorkshopPrice({ workshopId: 1, seasonId: 2 }),
          workshop: { id: 1, name: 'Théâtre' },
        },
        {
          ...buildPrismaWorkshopPrice({ workshopId: 2, seasonId: 2 }),
          workshop: { id: 2, name: 'Musique' },
        },
      ];
      (prisma as any).workshopPrice.findMany.mockResolvedValue(prices);

      const result = await workshopPriceService.getAllForSeason(2);

      expect(result).toHaveLength(2);
      expect(prisma.workshopPrice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 2 },
          include: { workshop: true },
        })
      );
    });

    it('retourne un tableau vide si aucun prix pour la saison', async () => {
      (prisma as any).workshopPrice.findMany.mockResolvedValue([]);

      const result = await workshopPriceService.getAllForSeason(9999);

      expect(result).toEqual([]);
    });
  });
});