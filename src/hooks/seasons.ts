import { useResource, useResourceById } from "@/lib/hooks/useResources";

export interface Season {
  
}

export function useSeasons() {
  return useResource<Season>('/api/seasons', {});
}