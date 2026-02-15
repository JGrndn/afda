'use client';

import useSWR from 'swr';
import { useResource } from '@/lib/hooks/useResources';
import {
  createPayment,
  updatePayment,
  deletePayment,
} from '@/app/(app)/payments/payments.actions';
import {
  PaymentDTO,
  PaymentWithDetailsDTO,
  FamilyPaymentSummaryDTO,
} from '@/lib/dto/payment.dto';
import {
  CreatePaymentInput,
  UpdatePaymentInput,
} from '@/lib/schemas/payment.input';
import { PaymentStatus } from '@/lib/domain/enums/payment.enum';
import { createCrudActionsHook } from '@/lib/actions/useServerActions';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UsePaymentsOptions {
  includeDetails?: boolean;
  familyId?: number;
  seasonId?: number;
  status?: PaymentStatus;
  sortBy?: 'paymentDate';
  sortDirection?: 'asc' | 'desc';
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const { includeDetails, familyId, seasonId, status, sortBy, sortDirection } = options;

  const filters: Record<string, any> = {};

  if (includeDetails) filters.includeDetails = 'true';
  if (familyId !== undefined) filters.familyId = familyId;
  if (seasonId !== undefined) filters.seasonId = seasonId;
  if (status) filters.status = status;

  return useResource<PaymentDTO | PaymentWithDetailsDTO>('/api/payments', {
    filters,
    sort: sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined,
    defaultSort: { field: 'paymentDate', direction: 'desc' },
  });
}

export function usePayment(id: number, includeDetails: boolean = false) {
  const url = id ? `/api/payments/${id}${includeDetails ? '?includeDetails=true' : ''}` : null;

  const { data, error, isLoading, mutate } = useSWR<PaymentDTO | PaymentWithDetailsDTO>(
    url,
    fetcher
  );

  return {
    payment: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFamilyBalance(familyId: number, seasonId: number) {
  const url =
    familyId && seasonId
      ? `/api/families/${familyId}/balance?seasonId=${seasonId}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<FamilyPaymentSummaryDTO>(url, fetcher);

  return {
    balance: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export const usePaymentActions = createCrudActionsHook<
  CreatePaymentInput,
  UpdatePaymentInput,
  PaymentDTO
>({
  create: createPayment,
  update: updatePayment,
  remove: deletePayment,
});