'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import { createFamily, updateFamily, deleteFamily } from '@/app/families/families.actions';
import { FamilyDTO, FamilyWithMembersDTO } from '@/lib/dto/family.dto';
import { CreateFamilyInput, UpdateFamilyInput } from '@/lib/schemas/family.input';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseFamiliesOptions {
  includeMemberCount?: boolean;
  sortBy?: 'name';
  sortDirection?: 'asc' | 'desc';
}

export function useFamilies(options: UseFamiliesOptions = {}) {
  const { includeMemberCount, sortBy, sortDirection } = options;

  return useResource<FamilyDTO | FamilyWithMembersDTO>('/api/families', {
    filters: includeMemberCount ? { includeMemberCount: true } : undefined,
    sort: sortBy && sortDirection
      ? { field: sortBy, direction: sortDirection }
      : undefined,
    defaultSort: { field: 'name', direction: 'asc' },
  });
}

export function useFamily(id: number, includeMembers: boolean = false) {
  const url = id 
    ? `/api/families/${id}${includeMembers ? '?includeMembers=true' : ''}` 
    : null;
  
  const { data, error, isLoading, mutate } = useSWR<FamilyDTO | FamilyWithMembersDTO>(
    url,
    fetcher
  );

  return {
    family: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFamilyActions() {
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
    create: (data: CreateFamilyInput) => run<FamilyDTO>(() => createFamily(data)),
    update: (id: number, data: UpdateFamilyInput) => run<FamilyDTO>(() => updateFamily(id, data)),
    remove: (id: number) => run<void>(() => deleteFamily(id)),
    isLoading,
    error,
  };
}