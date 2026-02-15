import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { seasonService } from '@/lib/services/season.service';
import { SeasonDetailPageClient } from './SeasonDetailPageClient';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

export default async function SeasonDetailPage({ 
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
  const seasonId = parseInt(resolvedParams.id);
  
  // 4. Fetch season côté serveur
  const initialSeason = await seasonService.getById(seasonId);
  
  // 5. Vérifier que la saison existe
  if (!initialSeason) {
    notFound();
  }
  
  // 6. Passer au Client Component avec le rôle
  return (
    <SeasonDetailPageClient 
      initialSeason={initialSeason}
      userRole={session.user.role}
    />
  );
}