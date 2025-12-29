'use server';

import { Prisma } from '@/generated/prisma/client'
import { seasonService } from '@/lib/services/seasons.service';

export async function createSeason(data: Prisma.SeasonCreateInput) {
  return seasonService.create(data);
}

export async function updateSeason(id: number, data: Prisma.SeasonUpdateInput) {
  return seasonService.update(id, data);
}

export async function deleteSeason(id: number) {
  return seasonService.delete(id);
}
