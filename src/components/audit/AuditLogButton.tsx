'use client';

import { useState } from 'react';
import { History, ChevronDown, ChevronRight, X, User, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuditLogs } from '@/hooks/auditLog.hook';
import { AuditLogDTO } from '@/lib/dto/auditLog.dto';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditLogModalProps {
  entityType: string;
  entityId: number;
  label?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACTION_CONFIG = {
  CREATE: { label: 'Création',     bg: 'bg-green-100', text: 'text-green-700' },
  UPDATE: { label: 'Modification', bg: 'bg-blue-100',  text: 'text-blue-700'  },
  DELETE: { label: 'Suppression',  bg: 'bg-red-100',   text: 'text-red-700'   },
} as const;

function relativeDate(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "à l'instant";
  if (mins  < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days  < 7)  return `il y a ${days}j`;
  return d.toLocaleDateString('fr-FR');
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';

  // ISO date strings
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // Numeric — try to detect amounts (field name check happens at call site)
  if (typeof value === 'number') return value.toLocaleString('fr-FR');

  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Returns fields that changed between before and after. */
function computeDiff(
  before: Record<string, unknown> | undefined,
  after:  Record<string, unknown> | undefined,
): { field: string; before: string; after: string }[] {
  const SKIP = ['updatedAt', 'createdAt'];

  // For UPDATE: only look at keys present in `after` (the patch),
  // not all keys from `before` (the full row). This avoids showing
  // unchanged fields as "modified".
  const keysToCompare = after
    ? Object.keys(after).filter((k) => !SKIP.includes(k))
    : Object.keys(before ?? {}).filter((k) => !SKIP.includes(k));

  return keysToCompare
    .filter((k) => JSON.stringify((before ?? {})[k]) !== JSON.stringify((after ?? {})[k]))
    .map((k) => ({
      field:  k,
      before: formatValue((before ?? {})[k]),
      after:  formatValue((after  ?? {})[k]),
    }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: AuditLogDTO['action'] }) {
  const cfg = ACTION_CONFIG[action];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function DiffTable({ diff }: { diff: { field: string; before: string; after: string }[] }) {
  if (diff.length === 0) {
    return <p className="text-xs text-gray-400 italic">Aucune différence détectable.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-3 py-2 font-semibold text-gray-500 w-1/3">Champ</th>
            <th className="text-left px-3 py-2 font-semibold text-red-500  w-1/3">Avant</th>
            <th className="text-left px-3 py-2 font-semibold text-green-600 w-1/3">Après</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {diff.map((row) => (
            <tr key={row.field} className="hover:bg-gray-50/50">
              <td className="px-3 py-2 font-mono text-gray-600">{row.field}</td>
              <td className="px-3 py-2 text-red-600 bg-red-50/40 font-mono break-all">{row.before}</td>
              <td className="px-3 py-2 text-green-700 bg-green-50/40 font-mono break-all">{row.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditLogEntry({ log }: { log: AuditLogDTO }) {
  const [expanded, setExpanded] = useState(false);

  const before = log.changes?.before as Record<string, unknown> | undefined;
  const after  = log.changes?.after  as Record<string, unknown> | undefined;
  const diff   = computeDiff(before, after);

  // Summary line: list changed fields for UPDATE
  const summary = log.action === 'UPDATE' && diff.length > 0
    ? diff.map((d) => d.field).join(', ')
    : null;

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Expand icon */}
        <span className="text-gray-300 flex-shrink-0">
          {expanded
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </span>

        <ActionBadge action={log.action} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-700">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {log.userName}
            </span>
            {summary && (
              <span className="text-xs text-gray-400 truncate">
                — {summary}
              </span>
            )}
          </div>
        </div>

        {/* Date */}
        <span
          className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0"
          title={new Date(log.createdAt).toLocaleString('fr-FR')}
        >
          <Clock className="w-3.5 h-3.5" />
          {relativeDate(log.createdAt)}
        </span>
      </button>

      {/* Expanded diff */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50/30">
          {/* Full timestamp */}
          <p className="text-xs text-gray-400 mb-3">
            {new Date(log.createdAt).toLocaleString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
            })}
            {' · '}par <span className="font-medium text-gray-600">{log.userName}</span>
          </p>

          {log.action === 'CREATE' && after && (
            <>
              <p className="text-xs font-semibold text-gray-500 mb-2">Valeurs initiales</p>
              <div className="rounded-lg border border-gray-100 overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(after)
                      .filter(([k]) => !['updatedAt', 'createdAt'].includes(k))
                      .map(([k, v]) => (
                        <tr key={k} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 font-mono text-gray-500 w-1/3">{k}</td>
                          <td className="px-3 py-2 font-mono text-gray-800 break-all">{formatValue(v)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {log.action === 'UPDATE' && (
            <>
              <p className="text-xs font-semibold text-gray-500 mb-2">Champs modifiés</p>
              <DiffTable diff={diff} />
            </>
          )}

          {log.action === 'DELETE' && before && (
            <>
              <p className="text-xs font-semibold text-gray-500 mb-2">Valeurs supprimées</p>
              <div className="rounded-lg border border-gray-100 overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(before)
                      .filter(([k]) => !['updatedAt', 'createdAt'].includes(k))
                      .map(([k, v]) => (
                        <tr key={k} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 font-mono text-gray-500 w-1/3">{k}</td>
                          <td className="px-3 py-2 font-mono text-red-700 break-all">{formatValue(v)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function AuditLogModalContent({
  entityType,
  entityId,
}: AuditLogModalProps) {
  const { logs, isLoading, isError } = useAuditLogs(entityType, entityId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 text-center py-8">
        Impossible de charger l'historique.
      </p>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-12">
        Aucune modification enregistrée.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <AuditLogEntry key={log.id} log={log} />
      ))}
    </div>
  );
}

export function AuditLogButton({ entityType, entityId, label = 'Historique' }: AuditLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hidden on mobile — audit is desktop-only */}
      <div className="hidden sm:block">
        <Button
          variant="secondary"
          size="sm"
          Icon={History}
          onClick={() => setIsOpen(true)}
          title="Historique des modifications"
        >
          {label}
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Historique des modifications"
        size="lg"
      >
        <AuditLogModalContent entityType={entityType} entityId={entityId} />
      </Modal>
    </>
  );
}