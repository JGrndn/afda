'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import {
  createRegistration,
  updateRegistration,
  deleteRegistration,
} from '@/app/registrations/registrations.actions';
import {
  RegistrationDTO,
  RegistrationWithDetailsDTO,
} from '@/lib/dto/registration.dto';
import {
  CreateRegistrationInput,
  UpdateRegistrationInput,
} from '@/lib/schemas/registration.input';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseRegistrationsOptions {
  includeDetails?: boolean;
  memberId?: number;
  seasonId?: number;
  workshopId?: number;
}

export function useRegistrations(options: UseRegistrationsOptions = {}) {
  const { includeDetails, memberId, seasonId, workshopId } = options;

  const filters: Record<string, any> = {};

  if (includeDetails) filters.includeDetails = 'true';
  if (memberId !== undefined) filters.memberId = memberId;
  if (seasonId !== undefined) filters.seasonId = seasonId;
  if (workshopId !== undefined) filters.workshopId = workshopId;

  return useResource<RegistrationDTO | RegistrationWithDetailsDTO>(
    '/api/registrations',
    {
      filters,
      defaultSort: { field: 'registrationDate', direction: 'desc' },
    }
  );
}

export function useRegistration(id: number, includeDetails: boolean = false) {
  const url = id
    ? `/api/registrations/${id}${includeDetails ? '?includeDetails=true' : ''}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<
    RegistrationDTO | RegistrationWithDetailsDTO
  >(url, fetcher);

  return {
    registration: data,
    isLoading,
    isError: error,
    mutate,
  };
}

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