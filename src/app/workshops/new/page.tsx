'use client';

import { useRouter } from 'next/navigation';
import { WorkshopForm } from '@/components/workshop/WorkshopForm';
import { useWorkshopActions } from '@/hooks/workshop';
import { ErrorMessage } from '@/components/ui';
import type { CreateWorkshopInput } from '@/lib/schemas/workshop.input';

export default function NewWorkshopPage() {
  const router = useRouter();
  const { create, isLoading, error } = useWorkshopActions();

  const handleSubmit = async (data: CreateWorkshopInput) => {
    await create(data);
    router.push('/workshops');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {error && <ErrorMessage error={error} />}
      <WorkshopForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/workshops')}
        isLoading={isLoading}
      />
    </div>
  );
}