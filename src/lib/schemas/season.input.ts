import z from "zod";
import { SeasonStatusSchema } from "@/lib/schemas/season.schema";

export const CreateSeasonSchema = z.object({
  startYear: z.number().int(),
  endYear: z.number().int(),
  status: SeasonStatusSchema,
  membershipAmount: z.number().positive(),
  discountPercent: z.number().min(0).max(100),
});
export type CreateSeasonInput = z.infer<typeof CreateSeasonSchema>;

export const UpdateSeasonSchema = CreateSeasonSchema.partial();
export type UpdateSeasonInput = z.infer<typeof UpdateSeasonSchema>;