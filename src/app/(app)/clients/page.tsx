import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { ClientsPageClient } from './ClientsPageClient';

export default async function ClientsPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER];
  if (!allowedRoles.includes(session.user.role)) redirect('/unauthorized');

  return <ClientsPageClient userRole={session.user.role} />;
}