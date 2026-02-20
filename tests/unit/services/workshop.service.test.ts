/**
 * Tests unitaires - workshopService
 *
 * Règles métier testées :
 *  - Nom unique (pas de doublon)
 *  - allowMultiple nécessite maxPerMember (validé par Zod)
 *  - Statut actif/inactif
 */

import { describe, it, expect, vi } from 'vitest';
import { workshopService } from '@/lib/services/workshop.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import { buildPrismaWorkshop } from '../../helpers/factories';

const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

describe('workshopService', () => {
  // ─────────────────────────────────────────
  //  create
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée un atelier avec des données valides', async () => {
      const created = buildPrismaWorkshop({
        name: 'Poterie',
        status: 'active',
        allowMultiple: false,
      });
      (prisma as any).workshop.create.mockResolvedValue(created);

      const result = await workshopService.create({
        name: 'Poterie',
        status: 'active',
        allowMultiple: false,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Poterie');
      expect(result.status).toBe('active');
      expect(prisma.workshop.create).toHaveBeenCalledOnce();
    });

    it('lève WORKSHOP_ALREADY_EXISTS si le nom existe déjà (P2002)', async () => {
      (prisma as any).workshop.create.mockRejectedValue(prismaError('P2002'));

      await expect(
        workshopService.create({
          name: 'Théâtre',
          status: 'active',
          allowMultiple: false,
        })
      ).rejects.toMatchObject({ code: 'WORKSHOP_ALREADY_EXISTS' });
    });

    it('crée un atelier avec inscriptions multiples autorisées', async () => {
      const created = buildPrismaWorkshop({
        name: 'Impro',
        allowMultiple: true,
        maxPerMember: 3,
      });
      (prisma as any).workshop.create.mockResolvedValue(created);

      const result = await workshopService.create({
        name: 'Impro',
        status: 'active',
        allowMultiple: true,
        maxPerMember: 3,
      });

      expect(result.allowMultiple).toBe(true);
      expect(result.maxPerMember).toBe(3);
    });

    it('accepte un atelier sans description (optionnel)', async () => {
      const created = buildPrismaWorkshop({ description: null });
      (prisma as any).workshop.create.mockResolvedValue(created);

      const result = await workshopService.create({
        name: 'Test',
        status: 'active',
        allowMultiple: false,
        description: null,
      });

      expect(result.description).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  //  update
  // ─────────────────────────────────────────
  describe('update', () => {
    it('met à jour un atelier existant', async () => {
      const updated = buildPrismaWorkshop({
        id: 1,
        name: 'Théâtre Avancé',
        status: 'active',
      });
      (prisma as any).workshop.update.mockResolvedValue(updated);

      const result = await workshopService.update(1, {
        name: 'Théâtre Avancé',
      });

      expect(result.name).toBe('Théâtre Avancé');
      expect(prisma.workshop.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Théâtre Avancé' },
      });
    });

    it('lève WORKSHOP_NOT_FOUND si latelier est introuvable (P2025)', async () => {
      (prisma as any).workshop.update.mockRejectedValue(prismaError('P2025'));

      await expect(
        workshopService.update(9999, { status: 'inactive' })
      ).rejects.toMatchObject({ code: 'WORKSHOP_NOT_FOUND' });
    });

    it('lève WORKSHOP_ALREADY_EXISTS si le nouveau nom existe déjà (P2002)', async () => {
      (prisma as any).workshop.update.mockRejectedValue(prismaError('P2002'));

      await expect(
        workshopService.update(1, { name: 'Musique' })
      ).rejects.toMatchObject({ code: 'WORKSHOP_ALREADY_EXISTS' });
    });

    it('peut désactiver un atelier', async () => {
      const updated = buildPrismaWorkshop({ id: 1, status: 'inactive' });
      (prisma as any).workshop.update.mockResolvedValue(updated);

      const result = await workshopService.update(1, { status: 'inactive' });

      expect(result.status).toBe('inactive');
    });

    it('peut modifier allowMultiple et maxPerMember', async () => {
      const updated = buildPrismaWorkshop({
        id: 1,
        allowMultiple: true,
        maxPerMember: 5,
      });
      (prisma as any).workshop.update.mockResolvedValue(updated);

      const result = await workshopService.update(1, {
        allowMultiple: true,
        maxPerMember: 5,
      });

      expect(result.allowMultiple).toBe(true);
      expect(result.maxPerMember).toBe(5);
    });
  });

  // ─────────────────────────────────────────
  //  delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('supprime un atelier existant', async () => {
      (prisma as any).workshop.delete.mockResolvedValue(
        buildPrismaWorkshop()
      );

      await expect(workshopService.delete(1)).resolves.toBeUndefined();
      expect(prisma.workshop.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lève WORKSHOP_NOT_FOUND si latelier est introuvable (P2025)', async () => {
      (prisma as any).workshop.delete.mockRejectedValue(prismaError('P2025'));

      await expect(workshopService.delete(9999)).rejects.toMatchObject({
        code: 'WORKSHOP_NOT_FOUND',
      });
    });

    it('propage les erreurs de contrainte FK (inscriptions existantes)', async () => {
      (prisma as any).workshop.delete.mockRejectedValue(
        prismaError('P2003') // FK violation
      );

      await expect(workshopService.delete(1)).rejects.toThrow();
    });
  });

  // ─────────────────────────────────────────
  //  getAll — filtres et recherche
  // ─────────────────────────────────────────
  describe('getAll', () => {
    it('retourne tous les ateliers triés par nom', async () => {
      const workshops = [
        buildPrismaWorkshop({ name: 'Cuisine' }),
        buildPrismaWorkshop({ name: 'Théâtre' }),
      ];
      (prisma as any).workshop.findMany.mockResolvedValue(workshops);

      const result = await workshopService.getAll();

      expect(result).toHaveLength(2);
      expect(prisma.workshop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('filtre par status si fourni', async () => {
      (prisma as any).workshop.findMany.mockResolvedValue([]);

      await workshopService.getAll({ status: 'active' });

      expect(prisma.workshop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        })
      );
    });

    it('filtre par recherche textuelle (nom ou description)', async () => {
      (prisma as any).workshop.findMany.mockResolvedValue([]);

      await workshopService.getAll({ search: 'théâtre' });

      expect(prisma.workshop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'théâtre', mode: 'insensitive' } },
              { description: { contains: 'théâtre', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('combine status et recherche', async () => {
      (prisma as any).workshop.findMany.mockResolvedValue([]);

      await workshopService.getAll({
        status: 'active',
        search: 'musique',
      });

      expect(prisma.workshop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  // ─────────────────────────────────────────
  //  getById
  // ─────────────────────────────────────────
  describe('getById', () => {
    it('retourne un atelier avec ses détails', async () => {
      const workshop = buildPrismaWorkshop({
        id: 1,
        name: 'Théâtre',
      });
      (prisma as any).workshop.findUnique.mockResolvedValue(workshop);

      const result = await workshopService.getById(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Théâtre');
    });

    it('retourne null si latelier nexiste pas', async () => {
      (prisma as any).workshop.findUnique.mockResolvedValue(null);

      const result = await workshopService.getById(9999);

      expect(result).toBeNull();
    });
  });
});