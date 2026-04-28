'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { requireRoleAction } from '@/lib/auth/action-protection';
import { FamilyDTO } from '@/lib/dto/family.dto';
import {
  CreateFamilyInput,
  CreateFamilySchema,
  UpdateFamilyInput,
  UpdateFamilySchema,
} from '@/lib/schemas/family.input';
import { familyService } from '@/lib/services/family.service';

export async function createFamily(input: CreateFamilyInput): Promise<FamilyDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = CreateFamilySchema.parse(input);
    const result = await familyService.create(data);
    return result;
  });
}

export async function updateFamily(id: number, input: UpdateFamilyInput): Promise<FamilyDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = UpdateFamilySchema.parse(input);
    const result = await familyService.update(id, data);
    return result;
  });
}

export async function deleteFamily(id: number): Promise<void> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    await familyService.delete(id);
  });
}