'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/generated/prisma/client';

export function useRequireRole(allowedRoles: UserRole[]) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!allowedRoles.includes(session.user.role)) {
      router.push('/unauthorized');
    }
  }, [session, status, router, allowedRoles]);

  return {
    user: session?.user,
    isLoading: status === 'loading',
  };
}