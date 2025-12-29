'use client'

import { useState } from "react";
import { Prisma, Season } from "@/generated/prisma";
import { useResource } from "@/lib/hooks/useResources";
import { createSeason, updateSeason, deleteSeason } from "@/actions/seasons.actions";
import useSWR from "swr";
import { ApiError } from "@/lib/hooks/apiClient";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseSeasonsOptions {
  status?: string;
  sortBy?: 'startYear';
  sortDirection?: 'asc' | 'desc';
}

export function useSeasons(options: UseSeasonsOptions = {}) {
  const {status, sortBy, sortDirection } = options;

  return useResource<Season>('/api/seasons', {
    filters: status ? { status : status} : undefined,
    sort : sortBy && sortDirection ? {
      field : sortBy,
      direction : sortDirection
    } : undefined,
    defaultSort: { field:'startYear', direction: 'desc' },
  });
}

export function useSeason(id: number){
    const { data, error, isLoading, mutate } = useSWR(
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

export function useSeasonMutations(){
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function run<T>(fn: () => Promise<T>) {
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
    create: (data: Prisma.SeasonCreateInput) => run(() => createSeason(data)),
    update: (id:number, data: Prisma.SeasonUpdateInput) => run(() => updateSeason(id, data)),
    remove: (id: number) => run(() => deleteSeason(id)),
    isLoading,
    error,
  };
}