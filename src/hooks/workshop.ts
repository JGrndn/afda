'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import {
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  createWorkshopPrice,
  updateWorkshopPrice,
  deleteWorkshopPrice,
} from '@/app/workshops/workshops.actions';
import { WorkshopDTO, WorkshopPriceDTO, WorkshopWithPricesAndSeasonDTO } from '@/lib/dto/workshop.dto';
import {
  CreateWorkshopInput,
  UpdateWorkshopInput,
  CreateWorkshopPriceInput,
  UpdateWorkshopPriceInput,
} from '@/lib/schemas/workshop.input';
import { WorkshopStatus } from '@/lib/domain/workshop.status';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseWorkshopsOptions {
  status?: WorkshopStatus;
  search?: string;
  sortBy?: 'name';
  sortDirection?: 'asc' | 'desc';
}

export function useWorkshops(options: UseWorkshopsOptions = {}) {
  const { status, search, sortBy, sortDirection } = options;
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

export function useWorkshopActions() {
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
    create: (data: CreateWorkshopInput) => run<WorkshopDTO>(() => createWorkshop(data)),
    update: (id: number, data: UpdateWorkshopInput) =>
      run<WorkshopDTO>(() => updateWorkshop(id, data)),
    remove: (id: number) => run<void>(() => deleteWorkshop(id)),
    isLoading,
    error,
  };
}

// WorkshopPrice Hooks
interface UseWorkshopPricesOptions {
  includeDetails?: boolean;
  workshopId?: number;
  seasonId?: number;
}

export function useWorkshopPrices(options: UseWorkshopPricesOptions = {}) {
  const { includeDetails, workshopId, seasonId } = options;

  const filters: Record<string, any> = {};

  if (includeDetails) {
    filters.includeDetails = 'true';
  }
  if (workshopId !== undefined) {
    filters.workshopId = workshopId;
  }
  if (seasonId !== undefined) {
    filters.seasonId = seasonId;
  }

  return useResource<WorkshopPriceDTO>('/api/workshop-prices', {
    filters,
    defaultSort: { field: 'seasonId', direction: 'desc' },
  });
}

export function useWorkshopPriceActions() {
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
    create: (data: CreateWorkshopPriceInput) =>
      run<WorkshopPriceDTO>(() => createWorkshopPrice(data)),
    update: (id: number, data: UpdateWorkshopPriceInput) =>
      run<WorkshopPriceDTO>(() => updateWorkshopPrice(id, data)),
    remove: (id: number) => run<void>(() => deleteWorkshopPrice(id)),
    isLoading,
    error,
  };
}