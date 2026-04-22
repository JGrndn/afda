import { Prisma } from '@/generated/prisma/client';
import { getAuditContext } from '@/lib/audit/auditContext';

/**
 * Maps a Prisma model name to the string stored in audit_logs.entity_type.
 * Only models listed here are audited.
 */
const AUDITED_MODELS: Record<string, string> = {
  Family:       'family',
  Member:       'member',
  Membership:   'membership',
  Registration: 'registration',
  Payment:      'payment',
  Season:       'season',
  Workshop:     'workshop',
  WorkshopPrice:'workshopPrice',
  Invoice:      'invoice',
  Client:       'client',
  Quote:        'quote',
  QuoteInvoice: 'quoteInvoice',
  User:         'user',
};

// Prisma operations we want to audit
type AuditedOperation =
  | 'create'
  | 'update'
  | 'updateMany'
  | 'delete'
  | 'deleteMany'
  | 'upsert';

const AUDITED_OPERATIONS: AuditedOperation[] = [
  'create',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'upsert',
];

function toAction(op: string): 'CREATE' | 'UPDATE' | 'DELETE' {
  if (op === 'create' || op === 'upsert') return 'CREATE';
  if (op === 'delete' || op === 'deleteMany') return 'DELETE';
  return 'UPDATE';
}

/**
 * Strips Prisma Decimal / Date objects so they serialise cleanly to JSON.
 */
function sanitise(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  // Prisma Decimal
  if (typeof (value as any)?.toNumber === 'function') return (value as any).toNumber();
  if (Array.isArray(value)) return value.map(sanitise);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitise(v)])
    );
  }
  return value;
}

/**
 * Returns the primary key (id) from a Prisma result or where clause.
 * Falls back to -1 when not determinable (e.g. deleteMany).
 */
function extractId(data: unknown): number {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.id === 'number') return d.id;
    if (typeof d.id === 'string') return parseInt(d.id, 10) || -1;
  }
  return -1;
}

/**
 * Prisma client extension that writes an AuditLog row after every
 * mutating operation on audited models.
 *
 * Usage: attach via `prisma.$extends(auditExtension)`.
 */
export const auditExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // ── 1. Quick exit for non-audited models / operations ──────────
          const entityType = model ? AUDITED_MODELS[model] : undefined;
          if (!entityType) return query(args);
          if (!(AUDITED_OPERATIONS as string[]).includes(operation)) return query(args);

          const ctx = getAuditContext();
          // If there's no audit context (e.g. seed scripts) just run the query.
          if (!ctx) return query(args);

          // ── 2. For update/delete, fetch the current state (before) ─────
          let before: unknown = undefined;
          if (
            (operation === 'update' || operation === 'delete') &&
            (args as any).where
          ) {
            try {
              // @ts-ignore — dynamic model access
              before = await (client as any)[lcFirst(model!)].findFirst({
                where: (args as any).where,
              });
              before = sanitise(before);
            } catch {
              // non-critical — continue without before snapshot
            }
          }

          // ── 3. Execute the actual query ────────────────────────────────
          const result = await query(args);

          // ── 4. Build the audit record ──────────────────────────────────
          const action = toAction(operation);
          const after = sanitise(result);
          const entityId =
            action === 'CREATE'
              ? extractId(result)
              : extractId((args as any).where ?? result);

          const changes =
            action === 'UPDATE'
              ? { before, after: sanitise((args as any).data ?? result) }
              : action === 'DELETE'
              ? { before }
              : { after };

          // ── 5. Write audit row (fire-and-forget, non-blocking) ─────────
          // We intentionally don't await so we never slow down the main path.
          // Errors are swallowed — audit failure must not break the app.
          ;(client as any).auditLog
            .create({
              data: {
                entityType,
                entityId,
                action,
                userId:   ctx.userId,
                userName: ctx.userName,
                changes,
              },
            })
            .catch((err: unknown) => {
              console.error('[AuditLog] Failed to write audit entry:', err);
            });

          return result;
        },
      },
    },
  });
});

function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}