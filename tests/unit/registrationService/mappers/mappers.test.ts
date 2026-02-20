/**
 * Tests unitaires - Mappers
 *
 * Les mappers transforment les objets Prisma bruts en DTOs.
 * Ce sont des fonctions pures (pas d'effets de bord, pas d'I/O) :
 * elles sont donc triviales à tester et doivent avoir une
 * couverture proche de 100%.
 *
 * On vérifie :
 *  - Que tous les champs sont correctement transférés
 *  - Que les Decimal Prisma sont convertis en number JS
 *  - Que les tableaux vides/null sont gérés proprement
 *  - Que les champs optionnels nullable sont bien passés
 */

import { describe, it, expect } from 'vitest';
import { toMemberDTO, toMemberWithFamilyNameDTO, toMemberWithFullDetailsDTO } from '@/lib/mappers/member.mapper';
import { toRegistrationDTO, toRegistrationWithWorkshopDetailsDTO } from '@/lib/mappers/registration.mapper';
import { toFamilyDTO } from '@/lib/mappers/family.mapper';
import {
  buildPrismaMember,
  buildPrismaMinorMember,
  buildPrismaFamily,
  buildPrismaWorkshop,
  buildPrismaRegistration,
  buildPrismaMembership,
} from '../../../helpers/factories';
import { Decimal } from '@prisma/client/runtime/client';

// ─────────────────────────────────────────────
//  toMemberDTO
// ─────────────────────────────────────────────
describe('toMemberDTO', () => {
  it('mappe tous les champs dun membre adulte correctement', () => {
    const member = buildPrismaMember({
      id: 42,
      familyId: 3,
      lastName: 'Dupont',
      firstName: 'Jean',
      isMinor: false,
      email: 'jean@example.com',
      phone: '0612345678',
    });

    const dto = toMemberDTO(member);

    expect(dto).toEqual({
      id: 42,
      familyId: 3,
      lastName: 'Dupont',
      firstName: 'Jean',
      isMinor: false,
      email: 'jean@example.com',
      phone: '0612345678',
      guardianLastName: null,
      guardianFirstName: null,
      guardianPhone: null,
      guardianEmail: null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    });
  });

  it('mappe correctement les infos tuteur dun membre mineur', () => {
    const minor = buildPrismaMinorMember({
      id: 7,
      guardianLastName: 'Dupont',
      guardianFirstName: 'Marie',
      guardianPhone: '0611111111',
      guardianEmail: 'marie@example.com',
    });

    const dto = toMemberDTO(minor);

    expect(dto.isMinor).toBe(true);
    expect(dto.guardianLastName).toBe('Dupont');
    expect(dto.guardianFirstName).toBe('Marie');
    expect(dto.guardianPhone).toBe('0611111111');
    expect(dto.guardianEmail).toBe('marie@example.com');
  });

  it('accepte un membre sans famille (familyId null)', () => {
    const member = buildPrismaMember({ familyId: null });

    const dto = toMemberDTO(member);

    expect(dto.familyId).toBeNull();
  });

  it("n'inclut PAS de champs supplémentaires (pas de fuite de données Prisma)", () => {
    const member = buildPrismaMember();
    const dto = toMemberDTO(member);

    // Ces champs Prisma internes ne doivent pas aparaître dans le DTO
    expect(dto).not.toHaveProperty('memberships');
    expect(dto).not.toHaveProperty('registrations');
    expect(dto).not.toHaveProperty('family');
  });
});

// ─────────────────────────────────────────────
//  toMemberWithFamilyNameDTO
// ─────────────────────────────────────────────
describe('toMemberWithFamilyNameDTO', () => {
  it('ajoute le nom de famille au DTO de base', () => {
    const family = buildPrismaFamily({ name: 'Martin' });
    const member = { ...buildPrismaMember(), family };

    const dto = toMemberWithFamilyNameDTO(member as any);

    expect(dto.familyName).toBe('Martin');
    expect(dto.firstName).toBeDefined(); // champs du DTO de base présents
  });

  it('retourne une chaîne vide si le membre nest rattaché à aucune famille', () => {
    const member = { ...buildPrismaMember(), family: null };

    const dto = toMemberWithFamilyNameDTO(member as any);

    expect(dto.familyName).toBe('');
  });
});

// ─────────────────────────────────────────────
//  toMemberWithFullDetailsDTO
// ─────────────────────────────────────────────
describe('toMemberWithFullDetailsDTO', () => {
  it('inclut famille, inscriptions et adhésions', () => {
    const family = buildPrismaFamily();
    const workshop = buildPrismaWorkshop();
    const registration = { ...buildPrismaRegistration(), workshop };
    const season = { id: 1, startYear: 2025, endYear: 2026, status:'active' };
    const membership = { ...buildPrismaMembership(), season };

    const member = {
      ...buildPrismaMember(),
      family,
      registrations: [registration],
      memberships: [membership],
    };

    const dto = toMemberWithFullDetailsDTO(member as any);

    expect(dto.family).toBeDefined();
    expect(dto.family?.name).toBe(family.name);
    expect(dto.registrations).toHaveLength(1);
    expect(dto.memberships).toHaveLength(1);
  });

  it('retourne des tableaux vides si pas dinscriptions ni adhésions', () => {
    const member = {
      ...buildPrismaMember(),
      family: null,
      registrations: [],
      memberships: [],
    };

    const dto = toMemberWithFullDetailsDTO(member as any);

    expect(dto.family).toBeNull();
    expect(dto.registrations).toEqual([]);
    expect(dto.memberships).toEqual([]);
  });
});

// ─────────────────────────────────────────────
//  toRegistrationDTO — conversion Decimal → number
// ─────────────────────────────────────────────
describe('toRegistrationDTO', () => {
  it('convertit les Decimal Prisma en number JS', () => {
    const registration = buildPrismaRegistration({
      id: 1,
      totalPrice: new Decimal('130.50'),
      discountPercent: new Decimal('10.00'),
    });

    const dto = toRegistrationDTO(registration as any);

    // Vérification critique : Decimal → number
    expect(typeof dto.totalPrice).toBe('number');
    expect(typeof dto.discountPercent).toBe('number');
    expect(dto.totalPrice).toBe(130.5);
    expect(dto.discountPercent).toBe(10);
  });

  it('mappe tous les champs identitaires', () => {
    const registration = buildPrismaRegistration({
      id: 5,
      memberId: 2,
      seasonId: 3,
      workshopId: 4,
      quantity: 2,
    });

    const dto = toRegistrationDTO(registration as any);

    expect(dto.id).toBe(5);
    expect(dto.memberId).toBe(2);
    expect(dto.seasonId).toBe(3);
    expect(dto.workshopId).toBe(4);
    expect(dto.quantity).toBe(2);
  });
});

// ─────────────────────────────────────────────
//  toRegistrationWithWorkshopDetailsDTO
// ─────────────────────────────────────────────
describe('toRegistrationWithWorkshopDetailsDTO', () => {
  it('inclut le DTO de latelier dans la réponse', () => {
    const workshop = buildPrismaWorkshop({
      id: 10,
      name: 'Théâtre',
      status: 'active',
    });
    const registration = {
      ...buildPrismaRegistration({ workshopId: 10 }),
      workshop,
    };

    const dto = toRegistrationWithWorkshopDetailsDTO(registration as any);

    expect(dto.workshop).toBeDefined();
    expect(dto.workshop.id).toBe(10);
    expect(dto.workshop.name).toBe('Théâtre');
    expect(dto.workshop.status).toBe('active');
  });
});

// ─────────────────────────────────────────────
//  toFamilyDTO
// ─────────────────────────────────────────────
describe('toFamilyDTO', () => {
  it('mappe tous les champs dune famille', () => {
    const family = buildPrismaFamily({
      id: 1,
      name: 'Dupont',
      address: '12 rue de la Paix',
      phone: '0612345678',
      email: 'dupont@example.com',
    });

    const dto = toFamilyDTO(family);

    expect(dto).toEqual({
      id: 1,
      name: 'Dupont',
      address: '12 rue de la Paix',
      phone: '0612345678',
      email: 'dupont@example.com',
      createdAt: family.createdAt,
      updatedAt: family.updatedAt,
    });
  });

  it('accepte les champs optionnels à null', () => {
    const family = buildPrismaFamily({
      address: null,
      phone: null,
      email: null,
    });

    const dto = toFamilyDTO(family);

    expect(dto.address).toBeNull();
    expect(dto.phone).toBeNull();
    expect(dto.email).toBeNull();
  });

  it("n'expose pas les membres de la famille (isolation du DTO)", () => {
    const family = buildPrismaFamily();
    const dto = toFamilyDTO(family);

    expect(dto).not.toHaveProperty('members');
    expect(dto).not.toHaveProperty('payments');
  });
});