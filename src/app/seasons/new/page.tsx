'use client';

import { useRouter } from 'next/navigation';
import { SeasonForm } from '@/components/season/SeasonForm';
import { useSeasonActions } from '@/hooks/season.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateSeasonInput } from '@/lib/schemas/season.input';

export default function NewSeasonPage() {
  const router = useRouter();
  const { create, isLoading, error } = useSeasonActions();

  const handleSubmit = async (data: CreateSeasonInput) => {
    await create(data);
    router.push('/seasons');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && <ErrorMessage error={error}/>}
      <SeasonForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/seasons')}
        isLoading={isLoading}
      />
    </div>
  );
}