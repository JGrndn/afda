import { z } from 'zod';

export function parseQueryValue<T>(
  value: string | null,
  schema: z.ZodType<T>
): T | undefined {
  if (value === null) return undefined;

  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}
