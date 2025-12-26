// src/hooks/useResource.ts
import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { apiClient, ApiError } from './apiClient';

interface UseResourceOptions {
  params?: Record<string, string | number>;
}

interface MutationState {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

/**
 * Hook générique pour gérer une ressource REST
 * Combine lecture (SWR) et mutations (POST/PUT/DELETE)
 */
export function useResource<T = any>(
  endpoint: string,
  options: UseResourceOptions = {}
) {
  const [mutationState, setMutationState] = useState<MutationState>({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
  });

  // Construction de l'URL avec params
  const url = options.params
    ? `${endpoint}?${new URLSearchParams(
        Object.entries(options.params).map(([k, v]) => [k, String(v)])
      )}`
    : endpoint;

  // GET - Lecture avec SWR (cache auto)
  const { data, error: swrError, isLoading, mutate } = useSWR<T[]>(
    url,
    () => apiClient.get<T[]>(url)
  );

  // Helper pour gérer les mutations
  const executeMutation = async <R = any>(
    type: 'isCreating' | 'isUpdating' | 'isDeleting',
    mutation: () => Promise<R>
  ): Promise<R | null> => {
    setMutationState(prev => ({ ...prev, [type]: true, error: null }));

    try {
      const result = await mutation();
      await mutate(); // Rafraîchir automatiquement
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An error occurred';
      setMutationState(prev => ({ ...prev, error: errorMessage }));
      return null;
    } finally {
      setMutationState(prev => ({ ...prev, [type]: false }));
    }
  };

  // POST - Création
  const create = useCallback(
    async (data: Partial<T>) => {
      return executeMutation('isCreating', () => 
        apiClient.post<T>(endpoint, data)
      );
    },
    [endpoint]
  );

  // PUT - Mise à jour
  const update = useCallback(
    async (id: number, data: Partial<T>) => {
      return executeMutation('isUpdating', () => 
        apiClient.put<T>(`${endpoint}/${id}`, data)
      );
    },
    [endpoint]
  );

  // DELETE - Suppression
  const remove = useCallback(
    async (id: number) => {
      return executeMutation('isDeleting', () => 
        apiClient.delete(`${endpoint}/${id}`)
      );
    },
    [endpoint]
  );

  return {
    // Lecture (SWR)
    data: data || [],
    isLoading,
    isError: swrError,
    mutate,

    // Mutations
    create,
    update,
    remove,

    // États des mutations
    ...mutationState,
  };
}

/**
 * Hook pour une ressource unique (by ID)
 */
export function useResourceById<T = any>(endpoint: string, id: number | null) {
  const [mutationState, setMutationState] = useState<MutationState>({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
  });

  // GET - Lecture avec SWR
  const url = id ? `${endpoint}/${id}` : null;
  const { data, error: swrError, isLoading, mutate } = useSWR<T>(
    url,
    url ? () => apiClient.get<T>(url) : null
  );

  const executeMutation = async <R = any>(
    type: 'isCreating' | 'isUpdating' | 'isDeleting',
    mutation: () => Promise<R>
  ): Promise<R | null> => {
    setMutationState(prev => ({ ...prev, [type]: true, error: null }));

    try {
      const result = await mutation();
      await mutate();
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An error occurred';
      setMutationState(prev => ({ ...prev, error: errorMessage }));
      return null;
    } finally {
      setMutationState(prev => ({ ...prev, [type]: false }));
    }
  };

  const update = useCallback(
    async (data: Partial<T>) => {
      if (!id) return null;
      return executeMutation('isUpdating', () => 
        apiClient.put<T>(`${endpoint}/${id}`, data)
      );
    },
    [endpoint, id]
  );

  const remove = useCallback(
    async () => {
      if (!id) return null;
      return executeMutation('isDeleting', () => 
        apiClient.delete(`${endpoint}/${id}`)
      );
    },
    [endpoint, id]
  );

  return {
    data,
    isLoading,
    isError: swrError,
    mutate,

    update,
    remove,

    ...mutationState,
  };
}