import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { clientService } from '@/lib/services/client.service';
import { ClientDetailPageClient } from './ClientDetailPageClient';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER];
  if (!allowedRoles.includes(session.user.role)) redirect('/unauthorized');

  const { id } = await params;
  const initialClient = await clientService.getById(parseInt(id));
  if (!initialClient) notFound();

  return (
    <ClientDetailPageClient
      initialClient={initialClient}
      userRole={session.user.role}
    />
  );
}