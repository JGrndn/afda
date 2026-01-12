'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { reconcileFamilySeason } from '@/lib/actions/reconcilation.actions';

interface ReconcileFamilySeasonButtonProps {
  familyId: number;
  seasonId: number;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
  className?: string;
}

export function ReconcileFamilySeasonButton({
  familyId,
  seasonId,
  variant = 'primary',
  size = 'sm',
  onSuccess,
  onError,
  className,
}: ReconcileFamilySeasonButtonProps) {
  const [isLoading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await reconcileFamilySeason(familyId, seasonId);
      await onSuccess?.();
    } catch(e){
      onError?.(e as Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      Icon={RefreshCw}
      isLoading={isLoading}
      iconClassName={isLoading ? 'animate-spin' : ''}
      onClick={handleClick}
      className={className}
    />
  );
}
