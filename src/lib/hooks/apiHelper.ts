import { z } from 'zod';
import { parseQueryValue } from '@/lib/zod/query';

export function parseQueryParams<
  TEnums extends Record<string, z.ZodTypeAny>
>(
  request: Request,
  enumParsers?: TEnums
) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;

  const sortOrder = parseQueryValue(
    searchParams.get('sortOrder'),
    z.enum(['asc', 'desc'])
  ) ?? 'asc';

  const page = parseQueryValue(
    searchParams.get('page'),
    z.coerce.number().int().positive()
  );

  const pageSize = parseQueryValue(
    searchParams.get('pageSize'),
    z.coerce.number().int().positive()
  );

  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const take = pageSize;

  const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;

  const filters: Record<string, unknown> = {};
  const knownParams = ['search', 'sortBy', 'sortOrder', 'page', 'pageSize'];

  searchParams.forEach((value, key) => {
    if (knownParams.includes(key)) return;

    // 🟢 Enum via Zod
    if (enumParsers?.[key]) {
      const parsed = parseQueryValue(value, enumParsers[key]);
      if (parsed !== undefined) {
        filters[key] = parsed;
      }
      return;
    }

    // 🔵 Fallback automatique
    if (value === 'true') filters[key] = true;
    else if (value === 'false') filters[key] = false;
    else if (!isNaN(Number(value))) filters[key] = Number(value);
    else filters[key] = value;
  });

  return {
    search,
    orderBy,
    skip,
    take,
    filters,
  };
}
