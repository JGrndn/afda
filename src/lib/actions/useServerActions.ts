// EN PREVISION D'UN FUTUR REFACTORING AVEC TOUTES LES ACTIONS
import { useState, useCallback } from 'react';
import { ActionResult } from '@/lib/actions';

/**
 * Hook générique pour gérer l'exécution des Server Actions
 */
export function useServerAction<TInput, TOutput>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const execute = useCallback(
    async (
      action: (input: TInput) => Promise<ActionResult<TOutput>>,
      input: TInput,
      options?: {
        onSuccess?: (data: TOutput) => void;
        onError?: (error: string) => void;
      }
    ): Promise<TOutput | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await action(input);

        if (result.success) {
          setData(result.data);
          options?.onSuccess?.(result.data);
          return result.data;
        } else {
          setError(result.error);
          options?.onError?.(result.error);
          return null;
        }
      } catch (err: any) {
        const errorMsg = err.message || 'An unexpected error occurred';
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  };
}

/**
 * Hook spécialisé pour les mutations avec SWR
 */
export function useServerMutation<TInput, TOutput>() {
  const { execute, isLoading, error } = useServerAction<TInput, TOutput>();

  const mutate = useCallback(
    async (
      action: (input: TInput) => Promise<ActionResult<TOutput>>,
      input: TInput,
      options?: {
        onSuccess?: (data: TOutput) => void;
        onError?: (error: string) => void;
      }
    ) => {
      return await execute(action, input, options);
    },
    [execute]
  );

  return {
    mutate,
    isLoading,
    error,
  };
}