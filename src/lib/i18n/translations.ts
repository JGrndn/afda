import { MembershipStatus } from "../domain/membership.enum";
import { PaymentStatus } from "../domain/payment.enum";
import { SeasonStatus } from "../domain/season.enum";
import { WorkshopStatus } from "../domain/workshop.enum";

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