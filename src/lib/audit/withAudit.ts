/**
 * src/lib/audit/withAudit.ts
 *
 * Wraps a server action with an audited Prisma client.
 * The user context is captured once and embedded in the Prisma extension
 * via closure — no AsyncLocalStorage needed.
 *
 * Usage:
 *   export async function updateMember(id: number, input: UpdateMemberInput) {
 *     return withAudit(async (db) => {
 *       const data = UpdateMemberSchema.parse(input);
 *       return memberService.update(id, data, db); // pass db to service
 *     });
 *   }
 *
 * If your services all import `prisma` directly, use the simpler pattern:
 *   return withAudit(() => memberService.update(id, data));
 * and swap the prisma import in services for getPrisma() (see below).
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildAuditExtension, AuditUserContext } from '@/lib/audit/auditExtension';

export type AuditedPrisma = ReturnType<typeof buildAuditedClient>;

function buildAuditedClient(ctx: AuditUserContext) {
  return prisma.$extends(buildAuditExtension(ctx));
}

/**
 * Runs `fn` with an audited Prisma client.
 * Services must use `getAuditedPrisma()` (or receive `db` as param)
 * to benefit from audit logging.
 */
export async function withAudit<T>(fn: () => Promise<T>): Promise<T> {
  const session = await auth();

  const ctx: AuditUserContext = session?.user
    ? {
        userId:   session.user.id,
        userName: session.user.name ?? session.user.email ?? 'unknown',
      }
    : { userId: 'system', userName: 'System' };

  // Store the audited client so services can pick it up via getAuditedPrisma()
  _currentAuditedPrisma = buildAuditedClient(ctx);

  try {
    return await fn();
  } finally {
    _currentAuditedPrisma = null;
  }
}

// ── Per-request slot ──────────────────────────────────────────────────────────
// Next.js server actions run in isolated async contexts per request,
// so a module-level variable is safe here (one request at a time per module
// instance in the Node.js worker).
let _currentAuditedPrisma: AuditedPrisma | null = null;

/**
 * Returns the audited Prisma client for the current request,
 * or the base prisma client if no audit context is active.
 *
 * Use this in services instead of importing `prisma` directly.
 */
export function getAuditedPrisma(): AuditedPrisma | typeof prisma {
  return _currentAuditedPrisma ?? prisma;
}