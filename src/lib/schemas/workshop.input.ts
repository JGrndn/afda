import { z } from 'zod';
import { WorkshopStatusSchema } from '@/lib/schemas/workshop.schema';

export const CreateWorkshopSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(1000).nullable().optional(),
  status: WorkshopStatusSchema.default('active'),
  allowMultiple: z.boolean().default(false),
  maxPerMember: z.number().int().positive().nullable().optional(),
}).refine(
  (data) => {
    // Si allowMultiple est true, maxPerMember doit être défini
    if (data.allowMultiple && !data.maxPerMember) {
      return false;
    }
    return true;
  },
  {
    message: "maxPerMember est requis lorsque allowMultiple est activé",
    path: ["maxPerMember"],
  }
);

export type CreateWorkshopInput = z.infer<typeof CreateWorkshopSchema>;

export const UpdateWorkshopSchema = CreateWorkshopSchema.partial();
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