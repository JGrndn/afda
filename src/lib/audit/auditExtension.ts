import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const AUDITED_MODELS: Record<string, string> = {
  Family:        'family',
  Member:        'member',
  Membership:    'membership',
  Registration:  'registration',
  Payment:       'payment',
  Season:        'season',
  Workshop:      'workshop',
  WorkshopPrice: 'workshopPrice',
  Invoice:       'invoice',
  Client:        'client',
  Quote:         'quote',
  QuoteInvoice:  'quoteInvoice',
  User:          'user',
};

type AuditedOperation = 'create' | 'update' | 'updateMany' | 'delete' | 'deleteMany' | 'upsert';
const AUDITED_OPERATIONS: AuditedOperation[] = ['create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];

function toAction(op: string): 'CREATE' | 'UPDATE' | 'DELETE' {
  if (op === 'create' || op === 'upsert') return 'CREATE';
  if (op === 'delete' || op === 'deleteMany') return 'DELETE';
  return 'UPDATE';
}

function sanitise(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as any)?.toNumber === 'function') return (value as any).toNumber();
  if (Array.isArray(value)) return value.map(sanitise);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitise(v)])
    );
  }
  return value;
}

function extractId(data: unknown): number {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.id === 'number') return d.id;
    if (typeof d.id === 'string') return parseInt(d.id, 10) || -1;
  }
  return -1;
}

function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export interface AuditUserContext {
  userId: string;
  userName: string;
}

// ── Singleton base client (no extension) used to write audit rows ─────────────
// Separate from the main client to avoid infinite recursion.
let _baseClient: PrismaClient | null = null;

function getBaseClient(): PrismaClient {
  if (!_baseClient) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    _baseClient = new PrismaClient({ adapter });
  }
  return _baseClient;
}

/**
 * Returns a Prisma extension that captures the user context via closure.
 *
 * Instead of AsyncLocalStorage (which doesn't propagate reliably across
 * Next.js server action boundaries), the user context is captured once
 * per request and embedded directly in the extension via closure.
 *
 * Usage:
 *   const auditedPrisma = prisma.$extends(buildAuditExtension({ userId, userName }));
 *   await auditedPrisma.member.update(...); // ← automatically audited
 */
export function buildAuditExtension(ctx: AuditUserContext) {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const entityType = model ? AUDITED_MODELS[model] : undefined;
            if (!entityType) return query(args);
            if (!(AUDITED_OPERATIONS as string[]).includes(operation)) return query(args);

            // ── Before snapshot (update / delete only) ──────────────────────
            let before: unknown = undefined;
            if (
              (operation === 'update' || operation === 'delete') &&
              (args as any).where
            ) {
              try {
                before = await (client as any)[lcFirst(model!)].findFirst({
                  where: (args as any).where,
                });
                before = sanitise(before);
              } catch {
                // non-critical — proceed without snapshot
              }
            }

            // ── Run the actual query ────────────────────────────────────────
            const result = await query(args);

            // ── Build audit record ──────────────────────────────────────────
            const action = toAction(operation);
            const entityId =
              action === 'CREATE'
                ? extractId(result)
                : extractId((args as any).where ?? result);

            const changes = (
              action === 'UPDATE'
                ? { before, after: sanitise((args as any).data ?? result) }
                : action === 'DELETE'
                ? { before }
                : { after: sanitise(result) }
            ) as Prisma.InputJsonValue;

            // ── Write audit row (fire-and-forget) ───────────────────────────
            getBaseClient()
              .auditLog.create({
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
}