import type { SeasonStatus } from '@/lib/schemas/season.schema';

// Season Status
export const SEASON_STATUS_TRANSLATIONS: Record<SeasonStatus, string> = {
  active: 'Active',
  inactive: 'Inactive'
};

// Helper générique pour traduire
export function translate<T extends string>(
  value: T,
  translations: Record<T, string>,
): string {
  return translations[value] || value;
}

// Helpers spécifiques
export const translateSeasonStatus = (status: SeasonStatus) =>
  translate(status, SEASON_STATUS_TRANSLATIONS);
