'use server';

import { SeasonDTO } from '@/lib/dto/season.dto';
import { CreateSeasonInput, CreateSeasonSchema, UpdateSeasonInput, UpdateSeasonSchema } from '@/lib/schemas/season.input';
import { seasonService } from '@/lib/services/seasons.service';

export async function createSeason(input: CreateSeasonInput): Promise<SeasonDTO> {
  const data = CreateSeasonSchema.parse(input);
  const result = await seasonService.create(data);
  return result;
}

export async function updateSeason(id: number, input: UpdateSeasonInput): Promise<SeasonDTO> {
  const data = UpdateSeasonSchema.parse(input);
  const result = await seasonService.update(id, data);
  return result;
}

export async function deleteSeason(id: number): Promise<void> {
  seasonService.delete(id);
}
