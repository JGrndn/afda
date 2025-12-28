import { z } from 'zod';
import { SeasonStatusSchema } from '@/lib/schemas/season';

export const SeasonQuerySchema = z.object({
  status: SeasonStatusSchema.optional(),
});
