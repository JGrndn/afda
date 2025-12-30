'use server';

import { SeasonDTO } from '@/lib/dto/season.type';
import { CreateSeasonSchema, UpdateSeasonSchema } from '@/lib/schemas/season.input';
import { seasonService } from '@/lib/services/seasons.service';

export async function createSeason(input: FormData): Promise<SeasonDTO> {
  const data = CreateSeasonSchema.parse(
    Object.fromEntries(input)
  );
  const result = await seasonService.create(data);
  return result;
}

export async function updateSeason(id: number, input: FormData): Promise<SeasonDTO> {
  const data = UpdateSeasonSchema.parse(
    Object.fromEntries(input)
  );
  const result = await seasonService.update(id, data);
  return result;
}

export async function deleteSeason(id: number) {
  return seasonService.delete(id);
}
