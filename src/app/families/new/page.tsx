'use client';

import { useRouter } from 'next/navigation';
import { FamilyForm } from '@/components/family/FamilyForm';
import { useFamilyActions } from '@/hooks/family';
import { ErrorMessage } from '@/components/ui';
import type { CreateFamilyInput } from '@/lib/schemas/family.input';

export default function NewFamilyPage() {
  const router = useRouter();
  const { create, isLoading, error } = useFamilyActions();

  const handleSubmit = async (data: CreateFamilyInput) => {
    await create(data);
    router.push('/families');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && <ErrorMessage error={error} />}
      <FamilyForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/families')}
        isLoading={isLoading}
      />
    </div>
  );
}