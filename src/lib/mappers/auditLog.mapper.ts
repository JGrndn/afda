import { AuditLogDTO } from "@/lib/dto/auditLog.dto";

export function toAuditLogDTO(log: any): AuditLogDTO {
  return {
    id:         log.id,
    entityType: log.entityType,
    entityId:   log.entityId,
    action:     log.action as AuditLogDTO['action'],
    userId:     log.userId,
    userName:   log.userName,
    changes:    log.changes as AuditLogDTO['changes'],
    createdAt:  log.createdAt,
  };
}