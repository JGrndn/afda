import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { UsersPageClient } from './UsersPageClient';

export const metadata = {
  title: 'Gestion des utilisateurs — AFDA',
};

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect('/signin');
  if (session.user.role !== UserRole.ADMIN) redirect('/unauthorized');

  return <UsersPageClient currentUserId={session.user.id} />;
}