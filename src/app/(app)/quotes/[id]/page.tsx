import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@/lib/domain/enums/user-role.enum';
import { quoteService } from '@/lib/services/quote.service';
import { QuoteDetailPageClient } from './QuoteDetailPageClient';

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/signin');

  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER];
  if (!allowedRoles.includes(session.user.role)) redirect('/unauthorized');

  const { id } = await params;
  const initialQuote = await quoteService.getById(parseInt(id));
  if (!initialQuote) notFound();

  return (
    <QuoteDetailPageClient
      initialQuote={initialQuote}
      userRole={session.user.role}
    />
  );
}