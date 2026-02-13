import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { memberService } from '@/lib/services/member.service';
import { MembersPageClient } from './MembersPageClient';

export default async function MembersPage() {
  // 1. Vérifier l'authentification
  const session = await auth();
  
  if (!session) {
    redirect('/signin');
  }
  
  // 2. Vérifier les permissions (tous les rôles peuvent voir)
  if (!['ADMIN', 'MANAGER', 'VIEWER'].includes(session.user.role)) {
    redirect('/unauthorized');
  }
  
  // 3. Fetch data côté serveur
  const initialMembers = await memberService.getAll();
  
  // 4. Passer au Client Component avec le rôle
  return (
    <MembersPageClient 
      initialMembers={initialMembers}
      userRole={session.user.role}
    />
  );
}