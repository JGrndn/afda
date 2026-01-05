import { MembershipStatus } from "../domain/membership.enum";
import { PaymentStatus } from "../domain/payment.enum";
import { SeasonStatus } from "../domain/season.enum";
import { WorkshopStatus } from "../domain/workshop.enum";

// Season Status
export const SEASON_STATUS_TRANSLATIONS: Record<SeasonStatus, string> = {
  active: 'Active',
  inactive: 'Inactive'
};
export const WORKSHOP_STATUS_TRANSLATIONS: Record<WorkshopStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif'
};
export const MEMBERSHIP_STATUS_TRANSLATIONS: Record<MembershipStatus, string> = {
  pending: "En cours",
  paid: "Payé",
  cancelled: "Annulé"
};
export const PAYMENT_STATUS_TRANSLATIONS: Record<PaymentStatus, string> = {
  pending: "En attente",
  cancelled: "Annulé",
  completed: "Payé"
};

// Helper générique pour traduire
export function translate<T extends string>(
  value: T,
  translations: Record<T, string>,
): string {
  return translations[value] || value;
}

// Helpers spécifiques
export const translateSeasonStatus = (status: SeasonStatus) => {
  return translate(status, SEASON_STATUS_TRANSLATIONS);
}
export const translateWorkshopStatus = (status: WorkshopStatus) => {
  return translate(status, WORKSHOP_STATUS_TRANSLATIONS);
}
export const translateMembershipStatus = (status:MembershipStatus) => {
  return translate(status, MEMBERSHIP_STATUS_TRANSLATIONS);
}
export const translatePaymentStatus = (status: PaymentStatus) => {
  return translate(status, PAYMENT_STATUS_TRANSLATIONS);
}