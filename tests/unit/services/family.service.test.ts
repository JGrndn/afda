/**
 * Tests unitaires - familyService
 *
 * Règles métier testées :
 *  - Nom unique (pas de doublon)
 *  - Tous les champs sont optionnels sauf le nom
 *  - Cascade delete protégé si membres existants
 */

import { describe, it, expect, vi } from 'vitest';
import { familyService } from '@/lib/services/family.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import {
  buildPrismaFamily,
  buildPrismaMember,
  buildPrismaMembership,
  buildPrismaRegistration,
  buildPrismaPayment,
} from '../../helpers/factories';

const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

describe('familyService', () => {
  // ─────────────────────────────────────────
  //  create
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée une famille avec des données valides', async () => {
      const created = buildPrismaFamily({
        name: 'Famille Martin',
        address: '12 rue de la Paix',
        phone: '0612345678',
        email: 'martin@example.com',
      });
      (prisma as any).family.create.mockResolvedValue(created);

      const result = await familyService.create({
        name: 'Famille Martin',
        address: '12 rue de la Paix',
        phone: '0612345678',
        email: 'martin@example.com',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Famille Martin');
      expect(result.address).toBe('12 rue de la Paix');
      expect(prisma.family.create).toHaveBeenCalledOnce();
    });

    it('lève FAMILY_ALREADY_EXISTS si le nom existe déjà (P2002)', async () => {
      (prisma as any).family.create.mockRejectedValue(prismaError('P2002'));

      await expect(
        familyService.create({
          name: 'Dupont',
          address: '1 rue Test',
        })
      ).rejects.toMatchObject({ code: 'FAMILY_ALREADY_EXISTS' });
    });

    it('accepte une famille avec seulement le nom (champs optionnels)', async () => {
      const created = buildPrismaFamily({
        name: 'Test',
        address: null,
        phone: null,
        email: null,
      });
      (prisma as any).family.create.mockResolvedValue(created);

      const result = await familyService.create({
        name: 'Test',
      });

      expect(result.name).toBe('Test');
      expect(result.address).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.email).toBeNull();
    });

    it('accepte une famille avec tous les champs', async () => {
      const created = buildPrismaFamily({
        name: 'Famille Complète',
        address: '123 Avenue',
        phone: '0123456789',
        email: 'test@example.com',
      });
      (prisma as any).family.create.mockResolvedValue(created);

      const result = await familyService.create({
        name: 'Famille Complète',
        address: '123 Avenue',
        phone: '0123456789',
        email: 'test@example.com',
      });

      expect(result).toBeDefined();
      expect(result.address).toBe('123 Avenue');
      expect(result.email).toBe('test@example.com');
    });
  });

  // ─────────────────────────────────────────
  //  update
  // ─────────────────────────────────────────
  describe('update', () => {
    it('met à jour une famille existante', async () => {
      const updated = buildPrismaFamily({
        id: 1,
        name: 'Dupont',
        email: 'nouveau@example.com',
      });
      (prisma as any).family.update.mockResolvedValue(updated);

      const result = await familyService.update(1, {
        email: 'nouveau@example.com',
      });

      expect(result.email).toBe('nouveau@example.com');
      expect(prisma.family.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { email: 'nouveau@example.com' },
      });
    });

    it('lève FAMILY_NOT_FOUND si la famille est introuvable (P2025)', async () => {
      (prisma as any).family.update.mockRejectedValue(prismaError('P2025'));

      await expect(
        familyService.update(9999, { name: 'Test' })
      ).rejects.toMatchObject({ code: 'FAMILY_NOT_FOUND' });
    });

    it('peut mettre à jour plusieurs champs en même temps', async () => {
      const updated = buildPrismaFamily({
        id: 1,
        address: 'Nouvelle adresse',
        phone: '0600000000',
      });
      (prisma as any).family.update.mockResolvedValue(updated);

      const result = await familyService.update(1, {
        address: 'Nouvelle adresse',
        phone: '0600000000',
      });

      expect(result.address).toBe('Nouvelle adresse');
      expect(result.phone).toBe('0600000000');
    });

    it('peut mettre un champ à null', async () => {
      const updated = buildPrismaFamily({ id: 1, email: null });
      (prisma as any).family.update.mockResolvedValue(updated);

      const result = await familyService.update(1, { email: null });

      expect(result.email).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  //  delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('supprime une famille existante sans membres', async () => {
      (prisma as any).family.delete.mockResolvedValue(buildPrismaFamily());

      await expect(familyService.delete(1)).resolves.toBeUndefined();
      expect(prisma.family.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lève FAMILY_NOT_FOUND si la famille est introuvable (P2025)', async () => {
      (prisma as any).family.delete.mockRejectedValue(prismaError('P2025'));

      await expect(familyService.delete(9999)).rejects.toMatchObject({
        code: 'FAMILY_NOT_FOUND',
      });
    });

    it('propage les erreurs de contrainte FK (membres existants)', async () => {
      // Si la famille a des membres, Prisma refuse la suppression
      (prisma as any).family.delete.mockRejectedValue(prismaError('P2003'));

      await expect(familyService.delete(1)).rejects.toThrow();
    });
  });

  // ─────────────────────────────────────────
  //  getAll
  // ─────────────────────────────────────────
  describe('getAll', () => {
    it('retourne toutes les familles triées par nom', async () => {
      const families = [
        buildPrismaFamily({ name: 'Dupont' }),
        buildPrismaFamily({ name: 'Martin' }),
      ];
      (prisma as any).family.findMany.mockResolvedValue(families);

      const result = await familyService.getAll();

      expect(result).toHaveLength(2);
      expect(prisma.family.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('retourne un tableau vide si aucune famille', async () => {
      (prisma as any).family.findMany.mockResolvedValue([]);

      const result = await familyService.getAll();

      expect(result).toEqual([]);
    });

    it('peut utiliser un tri personnalisé', async () => {
      (prisma as any).family.findMany.mockResolvedValue([]);

      await familyService.getAll({
        orderBy: { createdAt: 'desc' },
      });

      expect(prisma.family.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  // ─────────────────────────────────────────
  //  getById — avec relations complètes
  // ─────────────────────────────────────────
  describe('getById', () => {
    it('retourne une famille avec tous ses détails', async () => {
      const family = buildPrismaFamily({ id: 1 });
      const member = buildPrismaMember({ familyId: 1 });
      const membership = buildPrismaMembership();
      const registration = buildPrismaRegistration();
      const payment = buildPrismaPayment();

      (prisma as any).family.findUnique.mockResolvedValue({
        ...family,
        members: [
          {
            ...member,
            memberships: [membership],
            registrations: [registration],
          },
        ],
        payments: [payment],
      });

      const result = await familyService.getById(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.members).toHaveLength(1);
      expect(result?.payments).toHaveLength(1);
    });

    it('retourne null si la famille nexiste pas', async () => {
      (prisma as any).family.findUnique.mockResolvedValue(null);

      const result = await familyService.getById(9999);

      expect(result).toBeNull();
    });

    it('retourne une famille sans membres ni paiements', async () => {
      const family = buildPrismaFamily({ id: 1 });

      (prisma as any).family.findUnique.mockResolvedValue({
        ...family,
        members: [],
        payments: [],
      });

      const result = await familyService.getById(1);

      expect(result?.members).toEqual([]);
      expect(result?.payments).toEqual([]);
    });
  });
});