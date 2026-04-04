import { z } from 'zod';

export const CreateClientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email('Email invalide').max(255).nullable().optional(),
  contact: z.string().max(200).nullable().optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;

export const UpdateClientSchema = CreateClientSchema.partial();
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;