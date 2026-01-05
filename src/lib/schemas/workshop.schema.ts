import { z } from 'zod';
import { WORKSHOP_STATUS, WorkshopStatus } from '@/lib/domain/workshop.status';

export const WorkshopStatusSchema = z.enum(
  Object.values(WORKSHOP_STATUS) as [WorkshopStatus, ...WorkshopStatus[]]
);

export const WORKSHOP_STATUS_OPTIONS = WorkshopStatusSchema.options;