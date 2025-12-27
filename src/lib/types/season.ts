// lib/types/season.ts
import type { Season as PrismaSeason} from '@/generated/prisma';
import type { SeasonStatus } from '@/lib/schemas/season';

export type Season = Omit<PrismaSeason, 'status'> & {
  status: SeasonStatus;
};
