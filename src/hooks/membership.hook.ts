'use client';

import { useState } from 'react';
import { createMembership, updateMembership, deleteMembership } from '@/app/memberships/memberships.actions';
import { MembershipDTO } from '@/lib/dto/membership.dto';
import { CreateMembershipInput, UpdateMembershipInput } from '@/lib/schemas/membership.input';

export function useMembershipActions() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    create: (data: CreateMembershipInput) => run<MembershipDTO>(() => createMembership(data)),
    update: (id: number, data: UpdateMembershipInput) =>
      run<MembershipDTO>(() => updateMembership(id, data)),
    remove: (id: number) => run<void>(() => deleteMembership(id)),
    isLoading,
    error,
  };
}