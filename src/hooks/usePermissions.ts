'use client';

import { useSession } from 'next-auth/react';

export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  
  return {
    // Permissions de lecture (tous)
    canView: !!role,
    
    // Permissions d'écriture (MANAGER + ADMIN)
    canCreate: role === 'ADMIN' || role === 'MANAGER',
    canEdit: role === 'ADMIN' || role === 'MANAGER',
    canDelete: role === 'ADMIN' || role === 'MANAGER',
    
    // Permission admin uniquement
    canManageUsers: role === 'ADMIN',
    
    // Infos
    role,
    isAdmin: role === 'ADMIN',
    isManager: role === 'MANAGER',
    isViewer: role === 'VIEWER',
  };
}