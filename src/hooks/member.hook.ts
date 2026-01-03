'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import { createMember, updateMember, deleteMember } from '@/app/members/members.actions';
import { MemberDTO, MemberWithFamilyNameDTO, MemberWithFullDetailsDTO } from '@/lib/dto/member.dto';
import { CreateMemberInput, UpdateMemberInput } from '@/lib/schemas/member.input';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseMembersOptions {
  search?: string;
  sortBy?: 'lastName' | 'firstName';
  sortDirection?: 'asc' | 'desc';
}

export function useMembers(options: UseMembersOptions = {}) {
  const { search, sortBy, sortDirection } = options;

  const filters: Record<string, any> = {};
  return useResource<MemberWithFamilyNameDTO>('/api/members', {
    filters,
    search,
    sort: sortBy && sortDirection
      ? { field: sortBy, direction: sortDirection }
      : undefined,
    defaultSort: { field: 'lastName', direction: 'asc' },
  });
}

export function useMember(id: number) {
  const url = id
    ? `/api/members/${id}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<MemberWithFullDetailsDTO>(
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