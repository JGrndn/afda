import { z } from 'zod';

// Season status
export const SeasonStatusSchema = z.enum(['active', 'inactive']);
export type SeasonStatus = z.infer<typeof SeasonStatusSchema>;

// Helpers pour obtenir toutes les valeurs (utile pour les selects)
export const SEASON_STATUSES = SeasonStatusSchema.options;