'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  content,
  onClose,
  onConfirm,
}: ConfirmModalProps) {

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm?.();
    onClose(); 
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <div className="space-y-4">
        <p>
          {content}
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
          >
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  );
}