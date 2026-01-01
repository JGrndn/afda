'use server';

import { FamilyDTO } from '@/lib/dto/family.dto';
import {
  CreateFamilyInput,
  CreateFamilySchema,
  UpdateFamilyInput,
  UpdateFamilySchema,
} from '@/lib/schemas/family.input';
import { familyService } from '@/lib/services/family.service';

export async function createFamily(input: CreateFamilyInput): Promise<FamilyDTO> {
  const data = CreateFamilySchema.parse(input);
  const result = await familyService.create(data);
  return result;
}

export async function updateFamily(id: number, input: UpdateFamilyInput): Promise<FamilyDTO> {
  const data = UpdateFamilySchema.parse(input);
  const result = await familyService.update(id, data);
  return result;
}

export async function deleteFamily(id: number): Promise<void> {
  await familyService.delete(id);
}