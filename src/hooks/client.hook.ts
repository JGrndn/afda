'use client';

import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import { createClient, updateClient, deleteClient } from '@/app/(app)/clients/clients.actions';
import { ClientDTO, ClientWithQuotesDTO } from '@/lib/dto/client.dto';
import { CreateClientInput, UpdateClientInput } from '@/lib/schemas/client.input';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseClientsOptions {
  search?: string;
  sortBy?: 'name';
  sortDirection?: 'asc' | 'desc';
}

export function useClients(options: UseClientsOptions = {}) {
  const { search, sortBy, sortDirection } = options;

  return useResource<ClientDTO>('/api/clients', {
    search,
    sort:
      sortBy && sortDirection
        ? { field: sortBy, direction: sortDirection }
        : undefined,
    defaultSort: { field: 'name', direction: 'asc' },
  });
}

export function useClient(id: number) {
  const url = id ? `/api/clients/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<ClientWithQuotesDTO>(url, fetcher);

  return {
    client: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export const useClientActions = createCrudActionsHook<
  CreateClientInput,
  UpdateClientInput,
  ClientDTO
>({
  create: createClient,
  update: updateClient,
  remove: deleteClient,
});