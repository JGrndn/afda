'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MemberForm } from '@/components/member/MemberForm';
import { useMemberActions } from '@/hooks/member';
import { ErrorMessage } from '@/components/ui';
import type { CreateMemberInput } from '@/lib/schemas/member.input';

export default function NewMemberPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const familyId = searchParams.get('familyId');
  
  const { create, isLoading, error } = useMemberActions();

  const handleSubmit = async (data: CreateMemberInput) => {
    await create(data);
    if (familyId) {
      router.push(`/families/${familyId}`);
    } else {
      router.push('/members');
    }
  };

  const initialData = familyId ? { familyId: parseInt(familyId) } : undefined;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && <ErrorMessage error={error} />}
      <MemberForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => familyId ? router.push(`/families/${familyId}`) : router.push('/members')}
        isLoading={isLoading}
      />
    </div>
  );
}