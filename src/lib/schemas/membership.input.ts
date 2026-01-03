import { z } from 'zod';
import { MembershipStatusSchema } from './membership.schema';
import { MEMBERSHIP_STATUS } from '../domain/membership.status';

export const CreateMembershipSchema = z.object({
  memberId: z.number().int().positive(),
  seasonId: z.number().int().positive(),
  familyOrder: z.number().int().positive().default(1),
  amount: z.number().positive(),
  status: MembershipStatusSchema.default(MEMBERSHIP_STATUS.PENDING),
  membershipDate: z.date().optional(),
});

export type CreateMembershipInput = z.infer<typeof CreateMembershipSchema>;

export const UpdateMembershipSchema = z.object({
  familyOrder: z.number().int().positive().optional(),
  amount: z.number().positive().optional(),
  status: MembershipStatusSchema.optional(),
  membershipDate: z.date().optional(),
});

export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;

export { MembershipStatusSchema };