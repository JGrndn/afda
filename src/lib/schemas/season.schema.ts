import { z } from 'zod';
import { SEASON_STATUS, SeasonStatus } from '@/lib/domain/enums/season.enum';

// Season status
export const SeasonStatusSchema = z.enum(Object.values(SEASON_STATUS) as [SeasonStatus, ...SeasonStatus[]]);

// Helpers pour obtenir toutes les valeurs (utile pour les selects)
export const SEASON_STATUS_OPTIONS = SeasonStatusSchema.options;
