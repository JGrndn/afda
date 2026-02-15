'use client';

import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import { createMember, updateMember, deleteMember } from '@/app/(app)/members/members.actions';
import { MemberDTO, MemberWithFamilyNameDTO, MemberWithFullDetailsDTO } from '@/lib/dto/member.dto';
import { CreateMemberInput, UpdateMemberInput } from '@/lib/schemas/member.input';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';

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

export const useMemberActions = createCrudActionsHook<
  CreateMemberInput,
  UpdateMemberInput,
  MemberDTO
>({
  create: createMember,
  update: updateMember,
  remove: deleteMember,
});