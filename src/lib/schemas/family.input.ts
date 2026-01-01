import { z } from 'zod';

export const CreateFamilySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email("Email invalide").max(255).nullable().optional(),
});

export type CreateFamilyInput = z.infer<typeof CreateFamilySchema>;

export const UpdateFamilySchema = CreateFamilySchema.partial();
export type UpdateFamilyInput = z.infer<typeof UpdateFamilySchema>;