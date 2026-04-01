'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';
import { InvoiceModal } from './InvoiceModal';
import { Button } from '@/components/ui';

export function InvoiceButton({
  invoice: initialInvoice,
  onInvoiceIssued,
}: {
  invoice: InvoiceDTO;
  onInvoiceIssued?: (issued: InvoiceDTO) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceDTO>(initialInvoice);

  const handleIssued = (issued: InvoiceDTO) => {
    setInvoice(issued);
    onInvoiceIssued?.(issued);
  };

  const isDraft = invoice.status === 'draft';

  return (
    <>
      <Button
        //variant={isDraft ? 'secondary' : 'primary'}
        size="sm"
        Icon={FileText}
        onClick={() => setIsOpen(true)}
      >
        {isDraft ? 'Aperçu facture' : 'Voir la facture'}
      </Button>

      <InvoiceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        invoice={invoice}
        onInvoiceIssued={handleIssued}
      />
    </>
  );
}