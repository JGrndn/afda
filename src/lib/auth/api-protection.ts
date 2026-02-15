import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/generated/prisma/client';

export async function requireAuth(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return session;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session; // Erreur d'auth
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return session;
}