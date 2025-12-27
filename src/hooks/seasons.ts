import { Season } from "@/generated/prisma";
import { useResource } from "@/lib/hooks/useResources";

interface UseSeasonsOptions {
  isActive?: boolean;
  sortBy?: 'startYear';
  sortDirection?: 'asc' | 'desc';
}

export function useSeasons(options: UseSeasonsOptions = {
  sortBy: 'startYear',
  sortDirection: 'desc'
}) {
  const {isActive, sortBy, sortDirection } = options;

  return useResource<Season>('/api/seasons', {
    filters: { isActive },
    sort : sortBy && sortDirection ? {
      field : sortBy,
      direction : sortDirection
    } : undefined,
    defaultSort: { field:'startYear', direction: 'desc' },
  });
}