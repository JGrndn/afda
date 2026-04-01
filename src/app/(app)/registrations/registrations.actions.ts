'use server';

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
  const data = CreateRegistrationSchema.parse(input);
  const result = await registrationService.create(data);
  return result;
}

export async function updateRegistration(
  id: number,
  input: UpdateRegistrationInput
): Promise<RegistrationDTO> {
  const data = UpdateRegistrationSchema.parse(input);
  const result = await registrationService.update(id, data);
  return result;
}

export async function deleteRegistration(id: number): Promise<void> {
  await registrationService.delete(id);
}