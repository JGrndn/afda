'use client';

import { useRouter } from 'next/navigation';
import { SeasonForm } from '@/components/season/SeasonForm';
import { useSeasonMutations } from '@/hooks/seasons';

export default function NewSeasonPage() {
  const router = useRouter();
  const { create, isLoading, error } = useSeasonMutations();

  const handleSubmit = async (data: any) => {
    const result = await create(data);
    if (result) {
      router.push('/seasons');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <SeasonForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/seasons')}
        isLoading={isLoading}
      />
    </div>
  );
}