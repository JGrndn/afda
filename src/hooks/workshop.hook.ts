'use client';

import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import { createWorkshop, updateWorkshop, deleteWorkshop } from '@/app/workshops/workshops.actions';
import { WorkshopDTO, WorkshopWithPricesAndSeasonDTO } from '@/lib/dto/workshop.dto';
import { CreateWorkshopInput, UpdateWorkshopInput } from '@/lib/schemas/workshop.input';
import { WorkshopStatus } from '@/lib/domain/enums/workshop.enum';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseWorkshopsOptions {
  status?: WorkshopStatus;
  seasonId?: number;
  search?: string;
  sortBy?: 'name';
  sortDirection?: 'asc' | 'desc';
}

export function useWorkshops(options: UseWorkshopsOptions = {}) {
  const { status, search, sortBy, sortDirection, seasonId } = options;
  const filters: Record<string, any> = {};
  if (status) {
    filters.status = status;
  }
  return useResource<WorkshopDTO>('/api/workshops', {
    filters,
    search,
    sort: sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined,
    defaultSort: { field: 'name', direction: 'asc' },
  });
}

export function useWorkshop(id: number) {
  let url = id ? `/api/workshops/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<WorkshopWithPricesAndSeasonDTO>(
    url,
    fetcher
  );

  return {
    workshop: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export const useWorkshopActions = createCrudActionsHook<
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopDTO
>({
  create: createWorkshop,
  update: updateWorkshop,
  remove: deleteWorkshop,
});