import { z } from 'zod';

export const CreateMemberSchema = z.object({
  familyId: z.number().int().positive().nullable().optional(),
  lastName: z.string().min(1, "Le nom est requis").max(100),
  firstName: z.string().min(1, "Le prénom est requis").max(100),
  isMinor: z.boolean().default(false),
  email: z.preprocess(val => val ? val : undefined, z.email("Email invalide").max(255).nullable()).optional(),
  phone: z.string().max(20).nullable().optional(),
  guardianLastName: z.string().max(100).nullable().optional(),
  guardianFirstName: z.string().max(100).nullable().optional(),
  guardianPhone: z.string().max(20).nullable().optional(),
  guardianEmail: z.preprocess(val => val ? val : undefined, z.email("Email invalide").max(255).nullable()).optional(),
}).refine(
  (data) => {
    // Si le membre est mineur, au moins un champ du tuteur doit être renseigné
    if (data.isMinor) {
      return !!(
        data.guardianLastName ||
        data.guardianFirstName ||
        data.guardianPhone ||
        data.guardianEmail
      );
    }
    return true;
  },
  {
    message: "Les informations du tuteur sont requises pour un mineur",
    path: ["guardianLastName"],
  }
);

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

export const UpdateMemberSchema = CreateMemberSchema.partial();
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;