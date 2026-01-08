'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { MemberForm } from '@/components/member/MemberForm';
import { useMemberActions } from '@/hooks/member.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateMemberInput } from '@/lib/schemas/member.input';

interface MemberSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  familyId?: number;
}

export function MemberSlideOver({
  isOpen,
  onClose,
  onSuccess,
  familyId,
}: MemberSlideOverProps) {
  const { create, isLoading, error } = useMemberActions();

  const handleSubmit = async (data: CreateMemberInput) => {
    const result = await create({...data});
    
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau membre"
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <MemberForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        initialData={{familyId:familyId}}
      />
    </SlideOver>
  );
}