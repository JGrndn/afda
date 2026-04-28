'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/generated/prisma/client';

export async function requireAuthAction() {
  const session = await auth();
  if (!session) redirect('/signin');
  return session;
}

export async function requireRoleAction(allowedRoles: UserRole[]) {
  const session = await requireAuthAction();
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }
  return session;
}