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
  buildPrismaSeason,
} from '../../../helpers/factories';
import { Decimal } from '@prisma/client/runtime/client';
import { toPaymentDTO, toPaymentWithDetailsDTO } from '@/lib/mappers/payment.mapper';
import { toMembershipDTO, toMembershipWithMemberDTO, toMembershipWithSeasonDTO } from '@/lib/mappers/membership.mapper';
import { toWorkshopPriceDTO, toWorkshopPriceWithSeasonInfoDTO, toWorkshopPriceWithWorkshopInfoDTO } from '@/lib/mappers/workshopPrice.mapper';
import { toWorkshopDTO, toWorkshopWithPricesAndSeasonDTO } from '@/lib/mappers/workshop.mapper';
import { toSeasonDTO, toSeasonWithPricesAndWorkshopDTO } from '@/lib/mappers/season.mapper';

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

// Factories inline pour éviter les dépendances circulaires
const buildPrismaWorkshopPrice = (overrides = {}) => ({
  id: 1,
  workshopId: 1,
  seasonId: 1,
  amount: new Decimal('130.00'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ─────────────────────────────────────────────
//  Season Mappers
// ─────────────────────────────────────────────
describe('toSeasonDTO', () => {
  it('mappe tous les champs dune saison correctement', () => {
    const season = buildPrismaSeason({
      id: 1,
      startYear: 2025,
      endYear: 2026,
      status: 'active',
      membershipAmount: new Decimal('120.00'),
      discountPercent: 10,
      totalDonations: new Decimal('500.00'),
    });

    const dto = toSeasonDTO(season as any);

    expect(dto).toEqual({
      id: 1,
      startYear: 2025,
      endYear: 2026,
      status: 'active',
      membershipAmount: 120,
      discountPercent: 10,
      totalDonations: 500,
      createdAt: season.createdAt,
      updatedAt: season.updatedAt,
    });
  });

  it('convertit les Decimal en number', () => {
    const season = buildPrismaSeason({
      membershipAmount: new Decimal('150.50'),
      totalDonations: new Decimal('1234.56'),
    });

    const dto = toSeasonDTO(season as any);

    expect(typeof dto.membershipAmount).toBe('number');
    expect(typeof dto.totalDonations).toBe('number');
    expect(dto.membershipAmount).toBe(150.5);
    expect(dto.totalDonations).toBe(1234.56);
  });
});

describe('toSeasonWithPricesAndWorkshopDTO', () => {
  it('inclut les prix des ateliers avec les infos datelier', () => {
    const workshop = buildPrismaWorkshop({ name: 'Théâtre' });
    const price = {
      ...buildPrismaWorkshopPrice({ amount: new Decimal('130.00') }),
      workshop,
    };
    const season = {
      ...buildPrismaSeason(),
      workshopPrices: [price],
    };

    const dto = toSeasonWithPricesAndWorkshopDTO(season as any);

    expect(dto.prices).toHaveLength(1);
    expect(dto.prices[0].workshop.name).toBe('Théâtre');
    expect(dto.prices[0].amount).toBe(130);
  });

  it('retourne un tableau vide si pas de prix', () => {
    const season = {
      ...buildPrismaSeason(),
      workshopPrices: [],
    };

    const dto = toSeasonWithPricesAndWorkshopDTO(season as any);

    expect(dto.prices).toEqual([]);
  });
});

// ─────────────────────────────────────────────
//  Workshop Mappers
// ─────────────────────────────────────────────
describe('toWorkshopDTO', () => {
  it('mappe tous les champs dun atelier', () => {
    const workshop = buildPrismaWorkshop({
      id: 5,
      name: 'Musique',
      description: 'Cours de musique',
      status: 'active',
      allowMultiple: true,
      maxPerMember: 3,
    });

    const dto = toWorkshopDTO(workshop as any);

    expect(dto).toEqual({
      id: 5,
      name: 'Musique',
      description: 'Cours de musique',
      status: 'active',
      allowMultiple: true,
      maxPerMember: 3,
      createdAt: workshop.createdAt,
      updatedAt: workshop.updatedAt,
    });
  });

  it('accepte description et maxPerMember null', () => {
    const workshop = buildPrismaWorkshop({
      description: null,
      maxPerMember: null,
    });

    const dto = toWorkshopDTO(workshop as any);

    expect(dto.description).toBeNull();
    expect(dto.maxPerMember).toBeNull();
  });
});

describe('toWorkshopWithPricesAndSeasonDTO', () => {
  it('inclut les prix avec les infos de saison', () => {
    const season = buildPrismaSeason({ startYear: 2025, endYear: 2026 });
    const price = {
      ...buildPrismaWorkshopPrice(),
      season,
    };
    const workshop = {
      ...buildPrismaWorkshop(),
      workshopPrices: [price],
    };

    const dto = toWorkshopWithPricesAndSeasonDTO(workshop as any);

    expect(dto.prices).toHaveLength(1);
    expect(dto.prices[0].season.startYear).toBe(2025);
  });
});

// ─────────────────────────────────────────────
//  WorkshopPrice Mappers
// ─────────────────────────────────────────────
describe('toWorkshopPriceDTO', () => {
  it('mappe tous les champs dun prix atelier', () => {
    const price = buildPrismaWorkshopPrice({
      id: 10,
      workshopId: 2,
      seasonId: 3,
      amount: new Decimal('150.00'),
    });

    const dto = toWorkshopPriceDTO(price as any);

    expect(dto).toEqual({
      id: 10,
      workshopId: 2,
      seasonId: 3,
      amount: 150,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
    });
  });

  it('convertit amount Decimal en number', () => {
    const price = buildPrismaWorkshopPrice({
      amount: new Decimal('175.50'),
    });

    const dto = toWorkshopPriceDTO(price as any);

    expect(typeof dto.amount).toBe('number');
    expect(dto.amount).toBe(175.5);
  });
});

describe('toWorkshopPriceWithSeasonInfoDTO', () => {
  it('inclut les infos de la saison', () => {
    const season = buildPrismaSeason({ startYear: 2025, endYear: 2026 });
    const price = {
      ...buildPrismaWorkshopPrice(),
      season,
    };

    const dto = toWorkshopPriceWithSeasonInfoDTO(price as any);

    expect(dto.season).toBeDefined();
    expect(dto.season.startYear).toBe(2025);
    expect(dto.season.endYear).toBe(2026);
  });
});

describe('toWorkshopPriceWithWorkshopInfoDTO', () => {
  it('inclut les infos de latelier', () => {
    const workshop = buildPrismaWorkshop({ name: 'Poterie', status: 'active' });
    const price = {
      ...buildPrismaWorkshopPrice(),
      workshop,
    };

    const dto = toWorkshopPriceWithWorkshopInfoDTO(price as any);

    expect(dto.workshop).toBeDefined();
    expect(dto.workshop.name).toBe('Poterie');
    expect(dto.workshop.status).toBe('active');
  });
});

// ─────────────────────────────────────────────
//  Membership Mappers
// ─────────────────────────────────────────────
describe('toMembershipDTO', () => {
  it('mappe tous les champs dune adhésion', () => {
    const membership = buildPrismaMembership({
      id: 1,
      memberId: 2,
      seasonId: 3,
      familyOrder: 2,
      amount: new Decimal('120.00'),
      status: 'completed',
    });

    const dto = toMembershipDTO(membership as any);

    expect(dto).toEqual({
      id: 1,
      memberId: 2,
      seasonId: 3,
      familyOrder: 2,
      amount: 120,
      status: 'completed',
      membershipDate: membership.membershipDate,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    });
  });

  it('convertit amount Decimal en number', () => {
    const membership = buildPrismaMembership({
      amount: new Decimal('150.75'),
    });

    const dto = toMembershipDTO(membership as any);

    expect(typeof dto.amount).toBe('number');
    expect(dto.amount).toBe(150.75);
  });
});

describe('toMembershipWithMemberDTO', () => {
  it('ajoute le nom complet du membre', () => {
    const member = buildPrismaMember({
      firstName: 'Alice',
      lastName: 'Dupont',
    });
    const membership = {
      ...buildPrismaMembership(),
      member,
    };

    const dto = toMembershipWithMemberDTO(membership as any);

    expect(dto.memberName).toBe('Alice Dupont');
    expect(dto.memberId).toBeDefined();
  });
});

describe('toMembershipWithSeasonDTO', () => {
  it('inclut les infos de la saison', () => {
    const season = buildPrismaSeason({ startYear: 2025, endYear: 2026 });
    const membership = {
      ...buildPrismaMembership(),
      season,
    };

    const dto = toMembershipWithSeasonDTO(membership as any);

    expect(dto.season).toBeDefined();
    expect(dto.season.startYear).toBe(2025);
    expect(dto.season.endYear).toBe(2026);
  });
});

// ─────────────────────────────────────────────
//  Payment Mappers
// ─────────────────────────────────────────────
describe('toPaymentDTO', () => {
  it('mappe tous les champs dun paiement', () => {
    const payment = buildPrismaPayment({
      id: 5,
      familyId: 10,
      seasonId: 2,
      amount: new Decimal('250.00'),
      paymentType: 'check',
      paymentDate: new Date('2025-09-15'),
      cashingDate: new Date('2025-09-20'),
      status: 'pending',
      reference: 'CHQ-12345',
      notes: 'Paiement en 2 fois',
    });

    const dto = toPaymentDTO(payment as any);

    expect(dto).toEqual({
      id: 5,
      familyId: 10,
      seasonId: 2,
      amount: 250,
      paymentType: 'check',
      paymentDate: new Date('2025-09-15'),
      cashingDate: new Date('2025-09-20'),
      status: 'pending',
      reference: 'CHQ-12345',
      notes: 'Paiement en 2 fois',
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  });

  it('convertit amount Decimal en number', () => {
    const payment = buildPrismaPayment({
      amount: new Decimal('99.99'),
    });

    const dto = toPaymentDTO(payment as any);

    expect(typeof dto.amount).toBe('number');
    expect(dto.amount).toBe(99.99);
  });

  it('accepte cashingDate, reference et notes à null', () => {
    const payment = buildPrismaPayment({
      cashingDate: null,
      reference: null,
      notes: null,
    });

    const dto = toPaymentDTO(payment as any);

    expect(dto.cashingDate).toBeNull();
    expect(dto.reference).toBeNull();
    expect(dto.notes).toBeNull();
  });
});

describe('toPaymentWithDetailsDTO', () => {
  it('ajoute le nom de famille et lannée de saison', () => {
    const family = { name: 'Martin' };
    const season = { startYear: 2025, endYear: 2026 };
    const payment = {
      ...buildPrismaPayment(),
      family,
      season,
    };

    const dto = toPaymentWithDetailsDTO(payment as any);

    expect(dto.familyName).toBe('Martin');
    expect(dto.seasonYear).toBe('2025-2026');
    expect(dto.amount).toBeDefined();
  });
});