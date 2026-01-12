'use client';

import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import { createFamily, updateFamily, deleteFamily } from '@/app/families/families.actions';
import { FamilyDTO, FamilyWithFullDetailsDTO } from '@/lib/dto/family.dto';
import { CreateFamilyInput, UpdateFamilyInput } from '@/lib/schemas/family.input';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseFamiliesOptions {
  sortBy?: 'name';
  sortDirection?: 'asc' | 'desc';
}

export function useFamilies(options: UseFamiliesOptions = {}) {
  const { sortBy, sortDirection } = options;

  return useResource<FamilyDTO >('/api/families', {
    sort: sortBy && sortDirection
      ? { field: sortBy, direction: sortDirection }
      : undefined,
    defaultSort: { field: 'name', direction: 'asc' },
  });
}

export function useFamily(id: number) {
  const url = id 
    ? `/api/families/${id}` 
    : null;
  
  const { data, error, isLoading, mutate } = useSWR<FamilyWithFullDetailsDTO>(
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

export const useFamilyActions = createCrudActionsHook<
  CreateFamilyInput,
  UpdateFamilyInput,
  FamilyDTO
>({
  create: createFamily,
  update: updateFamily,
  remove: deleteFamily,
});