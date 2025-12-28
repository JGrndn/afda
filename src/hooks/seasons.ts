import { Season } from "@/generated/prisma";
import { useResource } from "@/lib/hooks/useResources";

interface UseSeasonsOptions {
  status?: string;
  sortBy?: 'startYear';
  sortDirection?: 'asc' | 'desc';
}

export function useSeasons(options: UseSeasonsOptions = {}) {
  const {status, sortBy, sortDirection } = options;

  return useResource<Season>('/api/seasons', {
    filters: status ? { status : status} : undefined,
    sort : sortBy && sortDirection ? {
      field : sortBy,
      direction : sortDirection
    } : undefined,
    defaultSort: { field:'startYear', direction: 'desc' },
  });
}