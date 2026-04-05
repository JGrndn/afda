// src/lib/schemas/workshop.input.ts
import { z } from 'zod';
import { WorkshopStatusSchema } from '@/lib/schemas/workshop.schema';

const WorkshopBaseSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(1000).nullable().optional(),
  status: WorkshopStatusSchema.default('active'),
  allowMultiple: z.boolean().default(false),
  maxPerMember: z.number().int().positive().nullable().optional(),
});

const workshopRefinement = (data: z.infer<typeof WorkshopBaseSchema>) => {
  if (data.allowMultiple && !data.maxPerMember) {
    return false;
  }
  return true;
};

const workshopRefinementConfig = {
  message: "maxPerMember est requis lorsque allowMultiple est activé",
  path: ["maxPerMember"],
};

export const CreateWorkshopSchema = WorkshopBaseSchema.refine(
  workshopRefinement,
  workshopRefinementConfig
);

export type CreateWorkshopInput = z.infer<typeof CreateWorkshopSchema>;

export const UpdateWorkshopSchema = WorkshopBaseSchema.partial().refine(
  (data) => {
    if (data.allowMultiple && !data.maxPerMember) {
      return false;
    }
    return true;
  },
  workshopRefinementConfig
);

export type UpdateWorkshopInput = z.infer<typeof UpdateWorkshopSchema>;

// WorkshopPrice Schemas
export const CreateWorkshopPriceSchema = z.object({
  workshopId: z.number().int().positive(),
  seasonId: z.number().int().positive(),
  amount: z.number().positive(),
});

export type CreateWorkshopPriceInput = z.infer<typeof CreateWorkshopPriceSchema>;

export const UpdateWorkshopPriceSchema = z.object({
  amount: z.number().positive(),
});

export type UpdateWorkshopPriceInput = z.infer<typeof UpdateWorkshopPriceSchema>;