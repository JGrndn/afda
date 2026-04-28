'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { requireRoleAction } from '@/lib/auth/action-protection';
import { RegistrationDTO } from '@/lib/dto/registration.dto';
import {
  CreateRegistrationInput,
  CreateRegistrationSchema,
  UpdateRegistrationInput,
  UpdateRegistrationSchema,
} from '@/lib/schemas/registration.input';
import { registrationService } from '@/lib/services/registration.service';

export async function createRegistration(
  input: CreateRegistrationInput
): Promise<RegistrationDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = CreateRegistrationSchema.parse(input);
    const result = await registrationService.create(data);
    return result;
  });
}

export async function updateRegistration(
  id: number,
  input: UpdateRegistrationInput
): Promise<RegistrationDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = UpdateRegistrationSchema.parse(input);
    const result = await registrationService.update(id, data);
    return result;
  });
}

export async function deleteRegistration(id: number): Promise<void> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    await registrationService.delete(id);
  });
}