import { Prisma } from '@/generated/prisma/client';

/**
 * Parse les query params et les convertit en options pour le service
 */
export function parseQueryParams(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extraction des params
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  const page = searchParams.has('page') ? Number(searchParams.get('page')) : undefined;
  const pageSize = searchParams.has('pageSize') ? Number(searchParams.get('pageSize')) : undefined;
  
  // ✅ Calcul skip/take pour Prisma
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const take = pageSize;
  
  // ✅ Construction orderBy pour Prisma
  const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;
  
  // ✅ Filtres (tous les autres params)
  const filters: Record<string, any> = {};
  const knownParams = ['search', 'sortBy', 'sortOrder', 'page', 'pageSize'];
  
  searchParams.forEach((value, key) => {
    if (!knownParams.includes(key)) {
      // Convertir les types
      if (value === 'true') filters[key] = true;
      else if (value === 'false') filters[key] = false;
      else if (!isNaN(Number(value))) filters[key] = Number(value);
      else filters[key] = value;
    }
  });
  
  return {
    search,
    orderBy,
    skip,
    take,
    filters,
  };
}