'use client'

import { useResource } from "@/lib/hooks/useResources";
import { createSeason, updateSeason, deleteSeason } from "@/app/seasons/seasons.actions";
import useSWR from "swr";
import { SeasonDTO, SeasonWithFullDetailsDTO, SeasonWithPricesAndWorkshopDTO } from "@/lib/dto/season.dto";
import { CreateSeasonInput, UpdateSeasonInput } from "@/lib/schemas/season.input";
import { createCrudActionsHook } from "@/lib/actions/useServerActions";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseSeasonsOptions {
  status?: SeasonDTO['status'];
  sortBy?: 'startYear';
  sortDirection?: 'asc' | 'desc';
}

export function useSeasons(options: UseSeasonsOptions = {}) {
  const {status, sortBy, sortDirection } = options;

  return useResource<SeasonDTO>('/api/seasons', {
    filters: status ? { status : status} : undefined,
    sort : sortBy && sortDirection ? {
      field : sortBy,
      direction : sortDirection
    } : undefined,
    defaultSort: { field:'startYear', direction: 'desc' },
  });
}

export function useSeason(id: number){
    const { data, error, isLoading, mutate } = useSWR<SeasonWithFullDetailsDTO>(
    id ? `/api/seasons/${id}` : null,
    fetcher
  );

  return {
    season: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSeasonWithWorkshopPrices(id: number){
    const { data, error, isLoading, mutate } = useSWR<SeasonWithPricesAndWorkshopDTO>(
    id ? `/api/seasons/${id}/workshopPrices` : null,
    fetcher
  );

  return {
    season: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export const useSeasonActions = createCrudActionsHook<
  CreateSeasonInput,
  UpdateSeasonInput,
  SeasonDTO
>({
  create: createSeason,
  update: updateSeason,
  remove: deleteSeason,
});
