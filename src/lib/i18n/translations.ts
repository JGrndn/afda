import { SeasonStatus } from "../domain/season.status";
import { WorkshopStatus } from "../domain/workshop.status";

// Season Status
export const SEASON_STATUS_TRANSLATIONS: Record<SeasonStatus, string> = {
  active: 'Active',
  inactive: 'Inactive'
};
export const WORKSHOP_STATUS_TRANSLATIONS: Record<WorkshopStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif'
}

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
