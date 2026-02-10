'use client';

import { SlideOver } from '@/components/ui/SlideOver';
import { MembershipForm } from '@/components/membership/MembershipForm';
import { useMembershipActions } from '@/hooks/membership.hook';
import { ErrorMessage } from '@/components/ui';
import type { CreateMembershipInput } from '@/lib/schemas/membership.input';

interface MembershipSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  memberId: number;
  seasonId: number;
}

export function MembershipSlideOver({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  seasonId,
}: MembershipSlideOverProps) {
  const { create, isLoading, error } = useMembershipActions();

  const handleSubmit = async (data: CreateMembershipInput) => {
    const result = await create({...data});
    
    if (result) {
      console.log('success')
      onSuccess?.();
      onClose();
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle adhésion"
      size="md"
    >
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}
      <MembershipForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        memberId={memberId}
        seasonId={seasonId}
      />
    </SlideOver>
  );
}