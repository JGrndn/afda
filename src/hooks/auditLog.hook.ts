'use client';

import { AuditLogDTO } from '@/lib/dto/auditLog.dto';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Failed to fetch audit logs');
  return r.json();
});

export function useAuditLogs(entityType: string, entityId: number, enabled = true) {
  const url = enabled ? `/api/audit/${entityType}/${entityId}` : null;

  const { data, error, isLoading } = useSWR<AuditLogDTO[]>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    logs: data ?? [],
    isLoading,
    isError: error,
  };
}