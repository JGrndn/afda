'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import {
  createMembership,
  updateMembership,
  deleteMembership,
} from '@/app/memberships/memberships.actions';
import {
  MembershipDTO,
  MembershipWithDetailsDTO,
  MembershipSummaryDTO,
} from '@/lib/dto/membership.dto';
import {
  CreateMembershipInput,
  UpdateMembershipInput,
} from '@/lib/schemas/membership.input';
import { MembershipStatus } from '@/lib/domain/membership.status';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/*interface UseMembershipsOptions {
  includeDetails?: boolean;
  includeSummary?: boolean;
  memberId?: number;
  seasonId?: number;
  familyId?: number;
  status?: MembershipStatus;
  sortBy?: 'membershipDate';
  sortDirection?: 'asc' | 'desc';
}*/

/*export function useMemberships(options: UseMembershipsOptions = {}) {
  const {
    includeDetails,
    includeSummary,
    memberId,
    seasonId,
    familyId,
    status,
    sortBy,
    sortDirection,
  } = options;

  const filters: Record<string, any> = {};

  if (includeDetails) filters.includeDetails = 'true';
  if (includeSummary) filters.includeSummary = 'true';
  if (memberId !== undefined) filters.memberId = memberId;
  if (seasonId !== undefined) filters.seasonId = seasonId;
  if (familyId !== undefined) filters.familyId = familyId;
  if (status) filters.status = status;

  return useResource<MembershipDTO | MembershipWithDetailsDTO | MembershipSummaryDTO>(
    '/api/memberships',
    {
      filters,
      sort: sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined,
      defaultSort: { field: 'membershipDate', direction: 'desc' },
    }
  );
}*/

/*export function useMembership(id: number) {
  const url = id
    ? `/api/memberships/${id}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<MembershipWithDetailsDTO>(
    url,
    fetcher
  );

  return {
    membership: data,
    isLoading,
    isError: error,
    mutate,
  };
}*/

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