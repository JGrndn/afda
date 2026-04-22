import { prisma } from '@/lib/prisma';
import { AuditLogDTO } from '@/lib/dto/auditlog.dto';
import { toAuditLogDTO } from '@/lib/mappers/auditLog.mapper';

export const auditLogService = {
  /**
   * Fetch audit logs for a specific entity, most recent first.
   */
  async getForEntity(
    entityType: string,
    entityId: number,
    limit = 50
  ): Promise<AuditLogDTO[]> {
    const logs = await (prisma as any).auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map(toAuditLogDTO);
  },

  /**
   * Fetch all audit logs for a given user.
   */
  async getForUser(userId: string, limit = 100): Promise<AuditLogDTO[]> {
    const logs = await (prisma as any).auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map(toAuditLogDTO);
  },

  /**
   * Fetch the most recent audit logs across all entities.
   */
  async getRecent(limit = 100): Promise<AuditLogDTO[]> {
    const logs = await (prisma as any).auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map(toAuditLogDTO);
  },
};