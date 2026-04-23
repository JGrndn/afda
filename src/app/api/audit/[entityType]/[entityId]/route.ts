import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/api-protection';
import { auditLogService } from '@/lib/services/auditlog.service';
import { validateId, isNextResponse } from '@/lib/api/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { entityType, entityId: entityIdStr } = await params;
  const entityId = validateId(entityIdStr);
  if (isNextResponse(entityId)) return entityId;

  try {
    const logs = await auditLogService.getForEntity(entityType, entityId);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}