import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { QuotesPageClient } from './QuotesPageClient';

export default async function QuotesPage() {
  const session = await auth();
  if (!session) redirect('/signin');

  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER];
  if (!allowedRoles.includes(session.user.role)) redirect('/unauthorized');

  return <QuotesPageClient userRole={session.user.role} />;
}