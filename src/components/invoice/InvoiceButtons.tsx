'use client';

import { useTransition } from 'react';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';


export function InvoiceButtons({
invoice,
familyId,
seasonId,
onUpdated,
}: {
invoice: InvoiceDTO;
familyId: string;
seasonId: string;
onUpdated: (invoice: InvoiceDTO) => void;
}) {
const [pending, startTransition] = useTransition();


return (
  <div className="flex gap-2">
    <a
    href={`/api/invoice/${invoice.id}/pdf?draft=true`}
    target="_blank"
    className="btn-secondary"
    >
      {invoice.status === 'draft' ? 'Voir le brouillon' : 'Voir la facture'}
    </a>

    {invoice.status === 'draft' && (
      <button
        className="btn-primary"
        disabled={pending}
        onClick={() => startTransition(async () => {
          
          })
        }
      >
        Émettre la facture
      </button>
    )}
    </div>
  );
}