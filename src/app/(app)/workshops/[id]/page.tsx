import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { workshopService } from '@/lib/services/workshop.service';
import { WorkshopDetailPageClient } from './WorkshopDetailPageClient';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

export default async function WorkshopDetailPage({ 
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
  const workshopId = parseInt(resolvedParams.id);
  
  // 4. Fetch workshop côté serveur
  const initialWorkshop = await workshopService.getById(workshopId);
  
  // 5. Vérifier que l'atelier existe
  if (!initialWorkshop) {
    notFound();
  }
  
  // 6. Passer au Client Component avec le rôle
  return (
    <WorkshopDetailPageClient 
      initialWorkshop={initialWorkshop}
      userRole={session.user.role}
    />
  );
}