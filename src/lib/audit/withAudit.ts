/**
 * src/lib/audit/withAudit.ts
 *
 * Wraps a server action (or any async function) with the audit context
 * so that Prisma mutations executed inside it are automatically logged.
 *
 * Usage in a server action:
 *
 *   export async function createFamily(input: CreateFamilyInput) {
 *     return withAudit(async () => {
 *       const data = CreateFamilySchema.parse(input);
 *       return familyService.create(data);
 *     });
 *   }
 */

import { auth } from '@/lib/auth';
import { withAuditContext } from '@/lib/audit/auditContext';

export async function withAudit<T>(fn: () => Promise<T>): Promise<T> {
  const session = await auth();

  const ctx = session?.user
    ? {
        userId:   session.user.id,
        userName: session.user.name ?? session.user.email ?? 'unknown',
      }
    : {
        userId:   'system',
        userName: 'System',
      };

  return withAuditContext(ctx, fn);
}