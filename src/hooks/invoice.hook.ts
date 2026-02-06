'use client';

import { useEffect, useState } from 'react';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';

export function useInvoice(
  familyId: number,
  seasonId: number | undefined
) {
  const [invoice, setInvoice] =
    useState<InvoiceDTO | null>(null);
  const [isLoading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!familyId || !seasonId) return;

    setLoading(true);

    fetch(
      `/api/invoice?familyId=${familyId}&seasonId=${seasonId}`
    )
      .then((res) => {
        if (!res.ok)
          throw new Error('Failed to load invoice');
        return res.json();
      })
      .then(setInvoice)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [familyId, seasonId]);

  return { invoice, isLoading, error };
}