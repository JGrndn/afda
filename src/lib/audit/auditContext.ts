import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContext {
  userId: string;
  userName: string;
}

/**
 * Stores the current user context so Prisma extensions can read it
 * without needing it passed explicitly through every service call.
 */
export const auditContext = new AsyncLocalStorage<AuditContext>();

/**
 * Run `fn` with the given audit context active.
 * Call this once per request, as early as possible (server action wrapper,
 * API route handler, etc.).
 */
export function withAuditContext<T>(ctx: AuditContext, fn: () => Promise<T>): Promise<T> {
  return auditContext.run(ctx, fn);
}

/**
 * Returns the current audit context, or null if none is active.
 */
export function getAuditContext(): AuditContext | null {
  return auditContext.getStore() ?? null;
}