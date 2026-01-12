'use client';

import { createRegistration, updateRegistration, deleteRegistration } from '@/app/registrations/registrations.actions';
import { RegistrationDTO } from '@/lib/dto/registration.dto';
import { CreateRegistrationInput, UpdateRegistrationInput } from '@/lib/schemas/registration.input';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';

export const useRegistrationActions = createCrudActionsHook<
  CreateRegistrationInput,
  UpdateRegistrationInput,
  RegistrationDTO
>({
  create: createRegistration,
  update: updateRegistration,
  remove: deleteRegistration,
});