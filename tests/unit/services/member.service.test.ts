/**
 * Tests unitaires - memberService
 *
 * On teste la logique métier du service sans toucher
 * à la base de données (Prisma est entièrement mocké).
 *
 * Cas couverts :
 *  - create : données valides, mineur sans tuteur, famille inexistante
 *  - update : succès, membre introuvable, famille introuvable
 *  - delete : succès, membre introuvable
 *  - getById : trouvé, non trouvé
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { memberService } from '@/lib/services/member.service';
import { prisma } from '@/lib/prisma';
import { DomainError } from '@/lib/errors/domain-error';
import {
  buildPrismaMember,
  buildPrismaMinorMember,
  buildPrismaFamily,
  buildPrismaWorkshop,
  buildPrismaMembership,
  buildPrismaRegistration,
  validCreateMemberInput,
  validCreateMinorInput,
} from '../../helpers/factories';

// ─────────────────────────────────────────────
//  Helpers pour simuler les erreurs Prisma
// ─────────────────────────────────────────────
const prismaError = (code: string) => {
  const err = new Error(`Prisma error ${code}`) as any;
  err.code = code;
  return err;
};

describe('memberService', () => {
  // ─────────────────────────────────────────
  //  getById
  // ─────────────────────────────────────────
  describe('getById', () => {
    it('retourne un membre avec ses détails quand il existe', async () => {
      const member = buildPrismaMember({ id: 42 });
      const family = buildPrismaFamily({ id: 1 });
      const registration = buildPrismaRegistration({
        memberId: 42,
        workshop: buildPrismaWorkshop(),
      });
      const membership = buildPrismaMembership({
        memberId: 42,
        season: { id: 1, startYear: 2025, endYear: 2026, status:'active' },
      });

      (prisma as any).member.findUnique.mockResolvedValue({
        ...member,
        family,
        registrations: [registration],
        memberships: [membership],
      } as any);

      const result = await memberService.getById(42);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(42);
      expect(result?.lastName).toBe('Dupont');
      expect(result?.family).toBeDefined();
      expect(result?.registrations).toHaveLength(1);
      expect(result?.memberships).toHaveLength(1);
    });

    it("retourne null quand le membre n'existe pas", async () => {
      (prisma as any).member.findUnique.mockResolvedValue(null);

      const result = await memberService.getById(9999);

      expect(result).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  //  create
  // ─────────────────────────────────────────
  describe('create', () => {
    it('crée un membre adulte avec des données valides', async () => {
      const created = buildPrismaMember({
        ...validCreateMemberInput,
        id: 10,
      });
      (prisma as any).member.create.mockResolvedValue(created as any);

      const result = await memberService.create(validCreateMemberInput);

      expect(prisma.member.create).toHaveBeenCalledOnce();
      expect(prisma.member.create).toHaveBeenCalledWith({
        data: validCreateMemberInput,
      });
      expect(result.id).toBe(10);
      expect(result.firstName).toBe('Sophie');
    });

    it('crée un membre mineur avec les infos tuteur', async () => {
      const created = buildPrismaMinorMember({ id: 11 });
      (prisma as any).member.create.mockResolvedValue(created as any);

      const result = await memberService.create(validCreateMinorInput);

      expect(result).toBeDefined();
      // Le service doit avoir accepté la création (pas de DomainError)
      expect(prisma.member.create).toHaveBeenCalledOnce();
    });

    it('lève GUARDIAN_INFO_REQUIRED si un mineur est sans infos tuteur', async () => {
      const minorWithoutGuardian = {
        ...validCreateMemberInput,
        isMinor: true,
        guardianLastName: null,
        guardianFirstName: null,
      };

      await expect(memberService.create(minorWithoutGuardian)).rejects.toThrow(
        DomainError
      );

      await expect(memberService.create(minorWithoutGuardian)).rejects.toMatchObject({
        code: 'GUARDIAN_INFO_REQUIRED',
      });

      // Prisma ne doit PAS avoir été appelé — la validation métier court-circuite
      expect(prisma.member.create).not.toHaveBeenCalled();
    });

    it('lève FAMILY_NOT_FOUND si la famille est introuvable (erreur Prisma P2003)', async () => {
      (prisma as any).member.create.mockRejectedValue(prismaError('P2003'));

      await expect(
        memberService.create({ ...validCreateMemberInput, familyId: 9999 })
      ).rejects.toMatchObject({ code: 'FAMILY_NOT_FOUND' });
    });

    it('propage les erreurs inattendues sans les transformer', async () => {
      const unexpectedError = new Error('DB connection lost');
      (prisma as any).member.create.mockRejectedValue(unexpectedError);

      await expect(memberService.create(validCreateMemberInput)).rejects.toThrow(
        'DB connection lost'
      );
    });
  });

  // ─────────────────────────────────────────
  //  update
  // ─────────────────────────────────────────
  describe('update', () => {
    it('met à jour un membre existant', async () => {
      const updated = buildPrismaMember({ id: 1, firstName: 'Pierre' });
      (prisma as any).member.update.mockResolvedValue(updated as any);

      const result = await memberService.update(1, { firstName: 'Pierre' });

      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { firstName: 'Pierre' },
      });
      expect(result.firstName).toBe('Pierre');
    });

    it('lève MEMBER_NOT_FOUND si le membre est introuvable (P2025)', async () => {
      (prisma as any).member.update.mockRejectedValue(prismaError('P2025'));

      await expect(
        memberService.update(9999, { firstName: 'Test' })
      ).rejects.toMatchObject({ code: 'MEMBER_NOT_FOUND' });
    });

    it('lève FAMILY_NOT_FOUND si la nouvelle famille est invalide (P2003)', async () => {
      (prisma as any).member.update.mockRejectedValue(prismaError('P2003'));

      await expect(
        memberService.update(1, { familyId: 9999 })
      ).rejects.toMatchObject({ code: 'FAMILY_NOT_FOUND' });
    });
  });

  // ─────────────────────────────────────────
  //  delete
  // ─────────────────────────────────────────
  describe('delete', () => {
    it('supprime un membre existant sans erreur', async () => {
      (prisma as any).member.delete.mockResolvedValue(
        buildPrismaMember() as any
      );

      await expect(memberService.delete(1)).resolves.toBeUndefined();
      expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lève MEMBER_NOT_FOUND si le membre est introuvable (P2025)', async () => {
      (prisma as any).member.delete.mockRejectedValue(prismaError('P2025'));

      await expect(memberService.delete(9999)).rejects.toMatchObject({
        code: 'MEMBER_NOT_FOUND',
      });
    });
  });

  // ─────────────────────────────────────────
  //  getAll (recherche)
  // ─────────────────────────────────────────
  describe('getAll', () => {
    it('retourne tous les membres triés par nom de famille', async () => {
      const members = [
        { ...buildPrismaMember({ lastName: 'Arnaud' }), family: null },
        { ...buildPrismaMember({ lastName: 'Dupont' }), family: null },
      ];
      (prisma as any).member.findMany.mockResolvedValue(members as any);

      const result = await memberService.getAll();

      expect(result).toHaveLength(2);
      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { lastName: 'asc' },
        })
      );
    });

    it('filtre par recherche textuelle (nom, prénom, email)', async () => {
      (prisma as any).member.findMany.mockResolvedValue([]);

      await memberService.getAll({ search: 'dupont' });

      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { lastName: { contains: 'dupont', mode: 'insensitive' } },
              { firstName: { contains: 'dupont', mode: 'insensitive' } },
              { email: { contains: 'dupont', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('filtre par familyId si fourni', async () => {
      (prisma as any).member.findMany.mockResolvedValue([]);

      await memberService.getAll({ familyId: 5 });

      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ familyId: 5 }),
        })
      );
    });
  });
});