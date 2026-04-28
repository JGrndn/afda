'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { requireRoleAction } from '@/lib/auth/action-protection';
import { SeasonDTO } from '@/lib/dto/season.dto';
import { CreateSeasonInput, CreateSeasonSchema, UpdateSeasonInput, UpdateSeasonSchema } from '@/lib/schemas/season.input';
import { seasonService } from '@/lib/services/season.service';

export async function createSeason(input: CreateSeasonInput): Promise<SeasonDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = CreateSeasonSchema.parse(input);
    const result = await seasonService.create(data);
    return result;
  });
}

export async function updateSeason(id: number, input: UpdateSeasonInput): Promise<SeasonDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = UpdateSeasonSchema.parse(input);
    const result = await seasonService.update(id, data);
    return result;
  });
}

export async function deleteSeason(id: number): Promise<void> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    seasonService.delete(id);
  });
}
