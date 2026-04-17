import { MembershipStatus } from "@/lib/domain/enums/membership.enum";
import { PaymentStatus } from "@/lib/domain/enums/payment.enum";
import { SeasonStatus } from "@/lib/domain/enums/season.enum";
import { WorkshopStatus } from "@/lib/domain/enums/workshop.enum";
import { QuoteStatus } from '@/lib/domain/enums/quote.enum';
import { QuoteInvoiceStatus } from '@/lib/domain/enums/quoteInvoice.enum';
import { UserRole } from "../domain/enums/user-role.enum";

// Season Status
export const SEASON_STATUS_TRANSLATIONS: Record<SeasonStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};
export const WORKSHOP_STATUS_TRANSLATIONS: Record<WorkshopStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif'
};
export const MEMBERSHIP_STATUS_TRANSLATIONS: Record<MembershipStatus, string> = {
  pending: "En cours",
  completed: "Validé",
  cancelled: "Annulé"
};
export const PAYMENT_STATUS_TRANSLATIONS: Record<PaymentStatus, string> = {
  pending: "En attente",
  cancelled: "Annulé",
  completed: "Payé"
};

export const QUOTE_STATUS_TRANSLATIONS: Record<QuoteStatus, string> = {
  draft:    'Brouillon',
  sent:     'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
  invoiced: 'Facturé',
};

export const QUOTE_INVOICE_STATUS_TRANSLATIONS: Record<QuoteInvoiceStatus, string> = {
  issued: 'Émise',
  paid: 'Payée',
  cancelled: 'Annulée',
};

export const USER_ROLE_TRANSLATIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]:   'Administrateur',
  [UserRole.MANAGER]: 'Gestionnaire',
  [UserRole.VIEWER]:  'Lecteur',
};