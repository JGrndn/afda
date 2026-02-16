import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Erreur de validation personnalisée
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valide le body d'une requête avec un schéma Zod
 * @param request - La requête Next.js
 * @param schema - Le schéma Zod de validation
 * @returns Les données validées ou une NextResponse d'erreur
 */
export async function validateBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 422 }
      );
    }

    // Erreur de parsing JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'JSON invalide' },
        { status: 400 }
      );
    }

    // Erreur inattendue
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}

/**
 * Valide les query params d'une requête avec un schéma Zod
 * @param request - La requête Next.js
 * @param schema - Le schéma Zod de validation
 * @returns Les données validées ou une NextResponse d'erreur
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): z.infer<T> | NextResponse {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const validatedData = schema.parse(params);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Paramètres invalides',
          details: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 422 }
      );
    }

    console.error('Query params validation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation des paramètres' },
      { status: 500 }
    );
  }
}

/**
 * Valide l'ID d'une route dynamique
 * @param id - L'ID à valider
 * @returns L'ID parsé ou une NextResponse d'erreur
 */
export function validateId(id: string): number | NextResponse {
  const parsed = parseInt(id, 10);
  
  if (isNaN(parsed) || parsed <= 0) {
    return NextResponse.json(
      { error: 'ID invalide' },
      { status: 400 }
    );
  }
  
  return parsed;
}

/**
 * Type guard pour vérifier si une valeur est une NextResponse
 */
export function isNextResponse(value: any): value is NextResponse {
  return value instanceof NextResponse;
}
