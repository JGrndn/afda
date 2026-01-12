import { useState, useCallback } from 'react';

function useAsyncActions() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
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
  }, []);

  return {
    run,
    isLoading,
    error,
  };
}

type CrudApi<TCreate, TUpdate, TDto> = {
  create: (data: TCreate) => Promise<TDto>;
  update: (id: number, data: TUpdate) => Promise<TDto>;
  remove: (id: number) => Promise<void>;
};

export function createCrudActionsHook<
  TCreate,
  TUpdate,
  TDto
>(api: CrudApi<TCreate, TUpdate, TDto>) {
  return function useCrudActions() {
    const { run, isLoading, error } = useAsyncActions();

    return {
      create: (data: TCreate) => run(() => api.create(data)),
      update: (id: number, data: TUpdate) =>
        run(() => api.update(id, data)),
      remove: (id: number) => run(() => api.remove(id)),
      isLoading,
      error,
    };
  };
}
