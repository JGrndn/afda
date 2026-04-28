import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { userService } from '@/lib/services/index';
import { ProfilePageClient } from './ProfilePageClient';

export const metadata = {
  title: 'Mon profil — AFDA',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect('/signin');

  const user = await userService.getById(session.user.id);
  if (!user) redirect('/signin');

  return (
    <ProfilePageClient
      initialName={user.name ?? ''}
      initialEmail={user.email}
      userRole={user.role}
    />
  );
}