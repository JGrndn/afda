import { z } from 'zod';
import { SeasonStatusSchema } from '@/lib/schemas/season.schema';

export const SeasonQuerySchema = z.object({
  status: SeasonStatusSchema.optional(),
});
