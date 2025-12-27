// src/hooks/useResource.ts
import useSWR from 'swr';
import { useState, useCallback, useMemo } from 'react';
import { apiClient, ApiError } from './apiClient';

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

interface FilterOptions {
  [key: string]: any;
}

interface UseResourceOptions {
  filters?: FilterOptions;
  sort?: SortOption;
  pagination?: PaginationOptions;
  defaultSort?: SortOption;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

  // ✅ Construction des paramètres de requête
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};

    // Filtres
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = String(value);
        }
      });
    }

    // Recherche
    if (options.search) {
      params.search = options.search;
    }

    // Tri (options.sort surcharge defaultSort)
    const sortToUse = options.sort || options.defaultSort;
    if (sortToUse) {
      params.sortBy = sortToUse.field;
      params.sortOrder = sortToUse.direction;
    }

    // Pagination
    if (options.pagination) {
      if (options.pagination.page !== undefined) {
        params.page = String(options.pagination.page);
      }
      if (options.pagination.pageSize !== undefined) {
        params.pageSize = String(options.pagination.pageSize);
      }
    }

    return params;
  }, [options.filters, options.search, options.sort, options.defaultSort, options.pagination]);

  // ✅ Construction de l'URL avec tous les params
  const url = useMemo(() => {
    const hasParams = Object.keys(queryParams).length > 0;
    return hasParams
      ? `${endpoint}?${new URLSearchParams(queryParams)}`
      : endpoint;
  }, [endpoint, queryParams]);

  // ✅ GET - Lecture avec SWR (cache auto)
  const { data: responseData, error: swrError, isLoading, mutate } = useSWR<T[] | PaginatedResponse<T>>(
    url,
    () => apiClient.get<T[] | PaginatedResponse<T>>(url)
  );

  // ✅ Détection automatique si la réponse est paginée
  const isPaginated = responseData && 'data' in responseData && 'total' in responseData;
  
  const data = isPaginated 
    ? (responseData as PaginatedResponse<T>).data 
    : (responseData as T[]) || [];
    
  const pagination = isPaginated 
    ? {
        total: (responseData as PaginatedResponse<T>).total,
        page: (responseData as PaginatedResponse<T>).page,
        pageSize: (responseData as PaginatedResponse<T>).pageSize,
        totalPages: (responseData as PaginatedResponse<T>).totalPages,
      }
    : undefined;

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
    // Données
    data,
    pagination,
    isLoading,
    isError: swrError,
    mutate,

    // Mutations
    create,
    update,
    delete: remove,

    // États des mutations
    ...mutationState,
  };
}