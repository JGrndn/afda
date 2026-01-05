import { z } from 'zod';

export const CreateRegistrationSchema = z.object({
  memberId: z.number().int().positive(),
  seasonId: z.number().int().positive(),
  workshopId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  totalPrice: z.number().positive(),
  discountPercent: z.number().min(0).max(100).default(0),
  registrationDate: z.date().optional(),
});

export type CreateRegistrationInput = z.infer<typeof CreateRegistrationSchema>;

export const UpdateRegistrationSchema = z.object({
  quantity: z.number().int().positive().optional(),
  totalPrice: z.number().positive().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  registrationDate: z.date().optional(),
});

export type UpdateRegistrationInput = z.infer<typeof UpdateRegistrationSchema>;