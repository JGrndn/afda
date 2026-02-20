/**
 * Tests unitaires - seasonService
 *
 * Règles métier testées :
 *  - Une seule saison peut être active à la fois
 *  - startYear doit être < endYear
 *  - Pas de doublon (même startYear + endYear)
 *  - membershipAmount est converti en Decimal
 */

import { describe, it, expect, vi } from 'vitest';
import { seasonService } from '@/lib/services/season.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import { buildPrismaSeason } from '../../helpers/factories';
import { Decimal } from '@prisma/client/runtime/client';

const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

describe('seasonService', () => {
  // ─────────────────────────────────────────
  //  create
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée une saison avec des données valides', async () => {
      const created = buildPrismaSeason({
        startYear: 2025,
        endYear: 2026,
        status: 'inactive',
        membershipAmount: new Decimal('120.00'),
      });
      (prisma as any).season.create.mockResolvedValue(created);

      const result = await seasonService.create({
        startYear: 2025,
        endYear: 2026,
        status: 'inactive',
        membershipAmount: 120,
        discountPercent: 0
      });

      expect(result).toBeDefined();
      expect(result.startYear).toBe(2025);
      expect(result.endYear).toBe(2026);
      expect(prisma.season.create).toHaveBeenCalledOnce();
    });

    it('lève INVALID_SEASON_STARTYEAR_ENDYEAR si startYear >= endYear', async () => {
      await expect(
        seasonService.create({
          startYear: 2025,
          endYear: 2025, // ← égal
          status: 'active',
          membershipAmount: 120,
          discountPercent: 0
        })
      ).rejects.toMatchObject({ code: 'INVALID_SEASON_STARTYEAR_ENDYEAR' });

      await expect(
        seasonService.create({
          startYear: 2026,
          endYear: 2025, // ← inversé
          status: 'active',
          membershipAmount: 120,
          discountPercent: 0
        })
      ).rejects.toMatchObject({ code: 'INVALID_SEASON_STARTYEAR_ENDYEAR' });

      // Ne doit PAS appeler Prisma
      expect(prisma.season.create).not.toHaveBeenCalled();
    });

    it('lève SEASON_ALREADY_EXISTS si même startYear/endYear (P2002)', async () => {
      (prisma as any).season.create.mockRejectedValue(prismaError('P2002'));

      await expect(
        seasonService.create({
          startYear: 2025,
          endYear: 2026,
          status: 'active',
          membershipAmount: 120,
          discountPercent: 0
        })
      ).rejects.toMatchObject({ code: 'SEASON_ALREADY_EXISTS' });
    });

    it('convertit membershipAmount en Decimal', async () => {
      const created = buildPrismaSeason();
      (prisma as any).season.create.mockResolvedValue(created);

      await seasonService.create({
        startYear: 2025,
        endYear: 2026,
        status: 'active',
        membershipAmount: 150,
        discountPercent: 0
      });

      expect(prisma.season.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          membershipAmount: expect.any(Decimal),
        }),
      });
    });
  });

  // ─────────────────────────────────────────
  //  update — règle métier : une seule saison active
  // ─────────────────────────────────────────
  describe('update', () => {
    it('met à jour une saison normalement', async () => {
      const updated = buildPrismaSeason({
        id: 1,
        membershipAmount: new Decimal('150.00'),
      });
      (prisma as any).season.update.mockResolvedValue(updated);

      const result = await seasonService.update(1, { membershipAmount: 150 });

      expect(result).toBeDefined();
      expect(prisma.season.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          membershipAmount: expect.any(Decimal),
        }),
      });
    });

    it('désactive les autres saisons actives quand on active une saison', async () => {
      // Setup : mock de updateMany (désactiver les autres)
      (prisma as any).season.updateMany.mockResolvedValue({ count: 1 });

      // Mock de update (activer celle-ci)
      const updated = buildPrismaSeason({ id: 2, status: 'active' });
      (prisma as any).season.update.mockResolvedValue(updated);

      await seasonService.update(2, { status: 'active' });

      // 1️⃣ Vérifie que updateMany a bien été appelé pour désactiver les autres
      expect(prisma.season.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'active',
          NOT: { id: 2 },
        },
        data: { status: 'inactive' },
      });

      // 2️⃣ Vérifie que update a été appelé pour activer celle-ci
      expect(prisma.season.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({ status: 'active' }),
      });
    });

    it('ne désactive pas les autres saisons si on met inactive', async () => {
      const updated = buildPrismaSeason({ id: 1, status: 'inactive' });
      (prisma as any).season.update.mockResolvedValue(updated);

      await seasonService.update(1, { status: 'inactive' });

      // updateMany ne doit PAS avoir été appelé
      expect(prisma.season.updateMany).not.toHaveBeenCalled();

      // Seulement update
      expect(prisma.season.update).toHaveBeenCalledOnce();
    });

    it('convertit membershipAmount en Decimal si fourni', async () => {
      const updated = buildPrismaSeason();
      (prisma as any).season.update.mockResolvedValue(updated);

      await seasonService.update(1, { membershipAmount: 200 });

      expect(prisma.season.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            membershipAmount: expect.any(Decimal),
          }),
        })
      );
    });

    it('ne modifie pas membershipAmount si non fourni', async () => {
      const updated = buildPrismaSeason();
      (prisma as any).season.update.mockResolvedValue(updated);

      await seasonService.update(1, { discountPercent: 15 });

      expect(prisma.season.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            membershipAmount: expect.anything(),
          }),
        })
      );
    });
  });

  // ─────────────────────────────────────────
  //  delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('supprime une saison existante', async () => {
      (prisma as any).season.delete.mockResolvedValue(buildPrismaSeason());

      await expect(seasonService.delete(1)).resolves.toBeDefined();
      expect(prisma.season.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('propage les erreurs Prisma (contraintes FK)', async () => {
      (prisma as any).season.delete.mockRejectedValue(
        prismaError('P2003') // FK violation
      );

      await expect(seasonService.delete(1)).rejects.toThrow();
    });
  });

  // ─────────────────────────────────────────
  //  getAll
  // ─────────────────────────────────────────
  describe('getAll', () => {
    it('retourne toutes les saisons triées par startYear décroissant', async () => {
      const seasons = [
        buildPrismaSeason({ startYear: 2025 }),
        buildPrismaSeason({ startYear: 2024 }),
      ];
      (prisma as any).season.findMany.mockResolvedValue(seasons);

      const result = await seasonService.getAll();

      expect(result).toHaveLength(2);
      expect(prisma.season.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { startYear: 'desc' },
        })
      );
    });

    it('filtre par status si fourni', async () => {
      (prisma as any).season.findMany.mockResolvedValue([]);

      await seasonService.getAll({ status: 'active' });

      expect(prisma.season.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        })
      );
    });
  });

  // ─────────────────────────────────────────
  //  getById
  // ─────────────────────────────────────────
  describe('getById', () => {
    it('retourne une saison avec ses détails', async () => {
      const season = buildPrismaSeason({ id: 1 });
      (prisma as any).season.findUnique.mockResolvedValue(season);

      const result = await seasonService.getById(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
    });

    it('retourne null si la saison nexiste pas', async () => {
      (prisma as any).season.findUnique.mockResolvedValue(null);

      const result = await seasonService.getById(9999);

      expect(result).toBeNull();
    });
  });
});