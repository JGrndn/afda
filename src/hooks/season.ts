'use client'

import { useState } from "react";
import { useResource } from "@/lib/hooks/useResources";
import { createSeason, updateSeason, deleteSeason } from "@/app/seasons/seasons.actions";
import useSWR from "swr";
import { SeasonDTO, SeasonWithPricesAndWorkshopDTO } from "@/lib/dto/season.dto";
import { CreateSeasonInput, UpdateSeasonInput } from "@/lib/schemas/season.input";

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
    const { data, error, isLoading, mutate } = useSWR<SeasonWithPricesAndWorkshopDTO>(
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

export function useSeasonActions(){
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
    create: (data: CreateSeasonInput) => run<SeasonDTO>(() => createSeason(data)),
    update: (id:number, data: UpdateSeasonInput) => run<SeasonDTO>(() => updateSeason(id, data)),
    remove: (id: number) => run<void>(() => deleteSeason(id)),
    isLoading,
    error,
  };
}