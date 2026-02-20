import { Decimal } from '@prisma/client/runtime/client';

// ─────────────────────────────────────────────
//  Factories : données mock qui reflètent exactement
//  les types Prisma du projet AFDA
// ─────────────────────────────────────────────

let idCounter = 1;
const nextId = () => idCounter++;

// Réinitialiser le compteur entre les tests si besoin
export const resetIdCounter = () => { idCounter = 1; };

// ── Member ───────────────────────────────────
export const buildPrismaMember = (overrides = {}) => ({
  id: nextId(),
  familyId: 1,
  lastName: 'Dupont',
  firstName: 'Jean',
  isMinor: false,
  email: 'jean.dupont@example.com',
  phone: '0612345678',
  guardianLastName: null,
  guardianFirstName: null,
  guardianPhone: null,
  guardianEmail: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const buildPrismaMinorMember = (overrides = {}) =>
  buildPrismaMember({
    isMinor: true,
    guardianLastName: 'Dupont',
    guardianFirstName: 'Marie',
    guardianPhone: '0611111111',
    guardianEmail: 'marie.dupont@example.com',
    ...overrides,
  });

// ── Family ───────────────────────────────────
export const buildPrismaFamily = (overrides = {}) => ({
  id: nextId(),
  name: 'Famille Dupont',
  address: '12 rue de la Paix, Paris',
  phone: '0612345678',
  email: 'dupont@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ── Season ───────────────────────────────────
export const buildPrismaSeason = (overrides = {}) => ({
  id: nextId(),
  startYear: 2025,
  endYear: 2026,
  status: 'active', // 'active' ou 'inactive' requis par le schéma
  membershipAmount: new Decimal('120.00'),
  discountPercent: 10,
  totalDonations: new Decimal('0.00'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Helper pour créer une saison inactive
export const buildInactiveSeason = (overrides = {}) =>
  buildPrismaSeason({ status: 'inactive', ...overrides });

// ── Workshop ─────────────────────────────────
export const buildPrismaWorkshop = (overrides = {}) => ({
  id: nextId(),
  name: 'Théâtre',
  description: 'Atelier de théâtre',
  status: 'active',
  allowMultiple: false,
  maxPerMember: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ── Membership ───────────────────────────────
export const buildPrismaMembership = (overrides = {}) => ({
  id: nextId(),
  memberId: 1,
  seasonId: 1,
  familyOrder: 1,
  amount: new Decimal('120.00'),
  status: 'pending',
  membershipDate: new Date('2025-09-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ── Registration ─────────────────────────────
export const buildPrismaRegistration = (overrides = {}) => ({
  id: nextId(),
  memberId: 1,
  seasonId: 1,
  workshopId: 1,
  quantity: 1,
  totalPrice: new Decimal('130.00'),
  discountPercent: new Decimal('0.00'),
  registrationDate: new Date('2025-09-15'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ── CreateMemberInput valides ─────────────────
export const validCreateMemberInput = {
  familyId: 1,
  lastName: 'Martin',
  firstName: 'Sophie',
  isMinor: false,
  email: 'sophie.martin@example.com',
  phone: null,
  guardianLastName: null,
  guardianFirstName: null,
  guardianPhone: null,
  guardianEmail: null,
};

export const validCreateMinorInput = {
  ...validCreateMemberInput,
  isMinor: true,
  guardianLastName: 'Martin',
  guardianFirstName: 'Paul',
  guardianPhone: '0600000000',
  guardianEmail: 'paul.martin@example.com',
};

// ── CreateFamilyInput valides ─────────────────
export const validCreateFamilyInput = {
  name: 'Famille Test',
  address: '1 rue du Test',
  phone: '0600000001',
  email: 'famille.test@example.com',
};

// ── CreateRegistrationInput valides ───────────
export const validCreateRegistrationInput = {
  memberId: 1,
  seasonId: 1,
  workshopId: 1,
  quantity: 1,
  totalPrice: 130,
  discountPercent: 0,
};