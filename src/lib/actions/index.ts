// EN PREVISION D'UN FUTUR REFACTORING AVEC TOUTES LES ACTIONS

'use server';

import { revalidatePath } from 'next/cache';

/**
 * Type helper pour les résultats d'actions
 */
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Wrapper pour standardiser la gestion d'erreurs
 */
export async function actionWrapper<T>(
  fn: () => Promise<T>,
  revalidatePaths?: string[]
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    
    // Revalidation automatique des chemins spécifiés
    if (revalidatePaths) {
      revalidatePaths.forEach(path => revalidatePath(path));
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Action error:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred' 
    };
  }
}

/**
 * Helper pour les mutations standards
 */
export async function createActionHelper<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput>,
  config?: {
    revalidatePaths?: string[];
    onSuccess?: (data: TOutput) => void;
  }
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    return actionWrapper(
      async () => {
        const result = await handler(input);
        config?.onSuccess?.(result);
        return result;
      },
      config?.revalidatePaths
    );
  };
}