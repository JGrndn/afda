import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { familyService } from '@/lib/services/family.service';
import { FamilyDetailPageClient } from './FamilyDetailPageClient';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

export default async function FamilyDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
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
  
  // 3. Résoudre les params
  const resolvedParams = await params;
  const familyId = parseInt(resolvedParams.id);
  
  // 4. Fetch family côté serveur
  const initialFamily = await familyService.getById(familyId);
  
  // 5. Vérifier que la famille existe
  if (!initialFamily) {
    notFound();
  }
  
  // 6. Passer au Client Component avec le rôle
  return (
    <FamilyDetailPageClient 
      initialFamily={initialFamily}
      userRole={session.user.role}
    />
  );
}