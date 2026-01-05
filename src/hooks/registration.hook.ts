'use client';

import { useState } from 'react';
import { createRegistration, updateRegistration, deleteRegistration } from '@/app/registrations/registrations.actions';
import { RegistrationDTO } from '@/lib/dto/registration.dto';
import { CreateRegistrationInput, UpdateRegistrationInput } from '@/lib/schemas/registration.input';

export function useRegistrationActions() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    create: (data: CreateRegistrationInput) =>
      run<RegistrationDTO>(() => createRegistration(data)),
    update: (id: number, data: UpdateRegistrationInput) =>
      run<RegistrationDTO>(() => updateRegistration(id, data)),
    remove: (id: number) => run<void>(() => deleteRegistration(id)),
    isLoading,
    error,
  };
}