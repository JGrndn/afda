import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { familyService } from '@/lib/services/family.service';
import { FamiliesPageClient } from './FamiliesPageClient';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

export default async function FamiliesPage() {
  // 1. Vérifier l'authentification
  const session = await auth();
  
  if (!session) {
    redirect('/signin');
  }
  
  // 2. Vérifier les permissions (tous les rôles peuvent voir)
  const allowedRoles: UserRole[] = [
    UserRole.ADMIN, 
    UserRole.MANAGER, 
    UserRole.VIEWER
  ];
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized');
  }
    
  // 4. Passer au Client Component avec le rôle
  return (
    <FamiliesPageClient 
      userRole={session.user.role}
    />
  );
}