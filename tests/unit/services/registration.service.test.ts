/**
 * Tests unitaires - registrationService
 *
 * Ce service contient les règles métier les plus complexes du projet :
 *  - Un membre doit d'abord avoir une adhésion (membership) pour s'inscrire
 *  - Les ateliers peuvent interdire les inscriptions multiples
 *  - Un maximum d'inscriptions par membre peut être défini
 *  - Un membre ne peut pas s'inscrire deux fois au même atelier / même saison
 *
 * Ces règles sont critiques : c'est exactement ce type de logique
 * qui doit être couvert par des tests unitaires en priorité.
 */

import { describe, it, expect, vi } from 'vitest';
import { registrationService } from '@/lib/services/registration.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import {
  buildPrismaWorkshop,
  buildPrismaMembership,
  buildPrismaRegistration,
  validCreateRegistrationInput,
} from '../../helpers/factories';
import { Decimal } from '@prisma/client/runtime/client';

// ─────────────────────────────────────────────
//  Helper — simule une erreur Prisma
// ─────────────────────────────────────────────
const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

// ─────────────────────────────────────────────
//  Helper — setup commun pour les tests create
// ─────────────────────────────────────────────
const setupValidCreation = (workshopOverrides = {}) => {
  const membership = buildPrismaMembership({ memberId: 1, seasonId: 1 });
  const workshop = buildPrismaWorkshop(workshopOverrides);

  vi.mocked(prisma.membership.findUnique).mockResolvedValue(membership as any);
  vi.mocked(prisma.workshop.findUnique).mockResolvedValue(workshop as any);

  return { membership, workshop };
};

describe('registrationService', () => {
  // ─────────────────────────────────────────
  //  create — règles métier
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée une inscription quand toutes les conditions sont remplies', async () => {
      setupValidCreation();

      const created = buildPrismaRegistration({
        memberId: 1,
        seasonId: 1,
        workshopId: 1,
        totalPrice: new Decimal('130.00'),
        discountPercent: new Decimal('0.00'),
      });
      vi.mocked(prisma.registration.create).mockResolvedValue(created as any);

      const result = await registrationService.create(validCreateRegistrationInput);

      expect(result).toBeDefined();
      expect(result.memberId).toBe(1);
      expect(result.totalPrice).toBe(130);
      expect(result.discountPercent).toBe(0);
      expect(prisma.registration.create).toHaveBeenCalledOnce();
    });

    // ── Règle 1 : membership obligatoire ──────
    it('lève MEMBERSHIP_REQUIRED si le membre na pas adhéré à la saison', async () => {
      // Membership inexistant → findUnique retourne null
      vi.mocked(prisma.membership.findUnique).mockResolvedValue(null);

      await expect(
        registrationService.create(validCreateRegistrationInput)
      ).rejects.toMatchObject({ code: 'MEMBERSHIP_REQUIRED' });

      // On ne doit pas aller plus loin dans le service
      expect(prisma.registration.create).not.toHaveBeenCalled();
    });

    // ── Règle 2 : atelier existant ────────────
    it('lève WORKSHOP_NOT_FOUND si latelier est introuvable', async () => {
      vi.mocked(prisma.membership.findUnique).mockResolvedValue(
        buildPrismaMembership() as any
      );
      vi.mocked(prisma.workshop.findUnique).mockResolvedValue(null);

      await expect(
        registrationService.create(validCreateRegistrationInput)
      ).rejects.toMatchObject({ code: 'WORKSHOP_NOT_FOUND' });
    });

    // ── Règle 3 : pas d'inscription multiple si non autorisée ──
    it('lève MULTIPLE_NOT_ALLOWED si latelier ninterdisant pas les multiples et quantity > 1', async () => {
      setupValidCreation({ allowMultiple: false });

      await expect(
        registrationService.create({
          ...validCreateRegistrationInput,
          quantity: 2, // ← interdit pour cet atelier
        })
      ).rejects.toMatchObject({ code: 'MULTIPLE_NOT_ALLOWED' });

      expect(prisma.registration.create).not.toHaveBeenCalled();
    });

    // ── Règle 4 : respect du maxPerMember ────
    it('lève MAX_PER_MEMBER_EXCEEDED si la quantité dépasse le max autorisé', async () => {
      setupValidCreation({
        allowMultiple: true,
        maxPerMember: 3,
      });

      await expect(
        registrationService.create({
          ...validCreateRegistrationInput,
          quantity: 4, // ← dépasse le max de 3
        })
      ).rejects.toMatchObject({ code: 'MAX_PER_MEMBER_EXCEEDED' });
    });

    it('autorise une inscription multiple dans les limites du maxPerMember', async () => {
      setupValidCreation({ allowMultiple: true, maxPerMember: 3 });

      const created = buildPrismaRegistration({
        quantity: 3,
        totalPrice: new Decimal('300.00'),
        discountPercent: new Decimal('0.00'),
      });
      vi.mocked(prisma.registration.create).mockResolvedValue(created as any);

      const result = await registrationService.create({
        ...validCreateRegistrationInput,
        quantity: 3,
        totalPrice: 300,
      });

      expect(result.quantity).toBe(3);
    });

    // ── Règle 5 : unicité (même atelier, même saison) ──
    it('lève WORKSHOP_REGISTRATION_ALREADY_EXISTS sur doublon (P2002)', async () => {
      setupValidCreation();
      vi.mocked(prisma.registration.create).mockRejectedValue(
        prismaError('P2002')
      );

      await expect(
        registrationService.create(validCreateRegistrationInput)
      ).rejects.toMatchObject({
        code: 'WORKSHOP_REGISTRATION_ALREADY_EXISTS',
      });
    });

    // ── Règle 6 : FK invalide ─────────────────
    it('lève MEMBER_SEASON_OR_WORKSHOP_NOT_FOUND sur FK invalide (P2003)', async () => {
      setupValidCreation();
      vi.mocked(prisma.registration.create).mockRejectedValue(
        prismaError('P2003')
      );

      await expect(
        registrationService.create(validCreateRegistrationInput)
      ).rejects.toMatchObject({
        code: 'MEMBER_SEASON_OR_WORKSHOP_NOT_FOUND',
      });
    });
  });

  // ─────────────────────────────────────────
  //  delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('supprime une inscription existante', async () => {
      vi.mocked(prisma.registration.delete).mockResolvedValue(
        buildPrismaRegistration() as any
      );

      await expect(registrationService.delete(1)).resolves.toBeUndefined();
      expect(prisma.registration.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lève REGISTRATION_NOT_FOUND si linscription est introuvable (P2025)', async () => {
      vi.mocked(prisma.registration.delete).mockRejectedValue(
        prismaError('P2025')
      );

      await expect(registrationService.delete(9999)).rejects.toMatchObject({
        code: 'REGISTRATION_NOT_FOUND',
      });
    });
  });

  // ─────────────────────────────────────────
  //  getAll — filtres
  // ─────────────────────────────────────────
  describe('getAll', () => {
    it('filtre les inscriptions par seasonId', async () => {
      vi.mocked(prisma.registration.findMany).mockResolvedValue([]);

      await registrationService.getAll({ seasonId: 3 });

      expect(prisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ seasonId: 3 }),
        })
      );
    });

    it('filtre les inscriptions par liste de memberIds', async () => {
      vi.mocked(prisma.registration.findMany).mockResolvedValue([]);

      await registrationService.getAll({ memberIds: [1, 2, 5] });

      expect(prisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            memberId: { in: [1, 2, 5] },
          }),
        })
      );
    });
  });
});