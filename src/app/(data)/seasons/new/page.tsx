'use client';

import { useRouter } from 'next/navigation';
import { SeasonForm } from '@/components/season/SeasonForm';
import { useSeasonActions } from '@/hooks/seasons';
import { ErrorMessage } from '@/components/ui';

export default function NewSeasonPage() {
  const router = useRouter();
  const { create, isLoading, error } = useSeasonActions();

  const handleSubmit = async (data: any) => {
    const result = await create(data);
    if (result) {
      router.push('/seasons');
    }
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