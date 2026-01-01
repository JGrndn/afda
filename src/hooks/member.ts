'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import { createMember, updateMember, deleteMember } from '@/app/members/members.actions';
import { MemberDTO, MemberWithFamilyDTO } from '@/lib/dto/member.dto';
import { CreateMemberInput, UpdateMemberInput } from '@/lib/schemas/member.input';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseMembersOptions {
  includeFamily?: boolean;
  familyId?: number;
  isMinor?: boolean;
  search?: string;
  sortBy?: 'lastName' | 'firstName';
  sortDirection?: 'asc' | 'desc';
}

export function useMembers(options: UseMembersOptions = {}) {
  const { includeFamily, familyId, isMinor, search, sortBy, sortDirection } = options;

  const filters: Record<string, any> = {};
  if (includeFamily) {
    filters.includeFamily = 'true';
  }
  if (familyId !== undefined) {
    filters.familyId = familyId;
  }
  if (isMinor !== undefined) {
    filters.isMinor = isMinor;
  }

  return useResource<MemberDTO | MemberWithFamilyDTO>('/api/members', {
    filters,
    search,
    sort: sortBy && sortDirection
      ? { field: sortBy, direction: sortDirection }
      : undefined,
    defaultSort: { field: 'lastName', direction: 'asc' },
  });
}

export function useMember(id: number, includeFamily: boolean = false) {
  const url = id
    ? `/api/members/${id}${includeFamily ? '?includeFamily=true' : ''}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<MemberDTO | MemberWithFamilyDTO>(
    url,
    fetcher
  );

  return {
    member: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMemberActions() {
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
    create: (data: CreateMemberInput) => run<MemberDTO>(() => createMember(data)),
    update: (id: number, data: UpdateMemberInput) => run<MemberDTO>(() => updateMember(id, data)),
    remove: (id: number) => run<void>(() => deleteMember(id)),
    isLoading,
    error,
  };
}