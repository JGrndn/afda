import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { memberService } from '@/lib/services/member.service';
import { MemberDetailPageClient } from './MemberDetailPageClient';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

export default async function MemberDetailPage({ 
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
  const memberId = parseInt(resolvedParams.id);
  
  // 4. Fetch member côté serveur
  const initialMember = await memberService.getById(memberId);
  
  // 5. Vérifier que le membre existe
  if (!initialMember) {
    notFound();
  }
  
  // 6. Passer au Client Component avec le rôle
  return (
    <MemberDetailPageClient 
      initialMember={initialMember}
      userRole={session.user.role}
    />
  );
}