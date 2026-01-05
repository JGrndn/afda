import { z } from 'zod';
import { MEMBERSHIP_STATUS, MembershipStatus } from '@/lib/domain/membership.enum';

export const MembershipStatusSchema = z.enum(
  Object.values(MEMBERSHIP_STATUS) as [MembershipStatus, ...MembershipStatus[]]
);

export const MEMBERSHIP_STATUS_OPTIONS = MembershipStatusSchema.options;