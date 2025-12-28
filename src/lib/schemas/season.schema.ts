import { z } from 'zod';

export const SEASON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Season status
export const SeasonStatusSchema = z.enum(Object.values(SEASON_STATUS));
export type SeasonStatus = z.infer<typeof SeasonStatusSchema>;

// Helpers pour obtenir toutes les valeurs (utile pour les selects)
export const SEASON_STATUS_OPTIONS = SeasonStatusSchema.options;