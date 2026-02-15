import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { seasonService } from '@/lib/services/season.service';
import { PaymentsPageClient } from './PaymentsPageClient';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

export default async function PaymentsPage() {
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
    <PaymentsPageClient 
      userRole={session.user.role}
    />
  );
}