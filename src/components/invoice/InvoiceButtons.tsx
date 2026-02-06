'use client';

import { InvoiceDTO } from '@/lib/dto/invoice.dto';

export function InvoiceButton({
  invoice,
}: {
  invoice: InvoiceDTO;
}) {
  const isDraft = invoice.status === 'draft';

  const href = isDraft
    ? `/api/invoice/preview?familyId=${invoice.familyId}&seasonId=${invoice.seasonId}`
    : `/api/invoice/${invoice.id}/pdf`;

  return (
    <a
      href={href}
      target="_blank"
      className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      {isDraft ? 'Voir la facture (brouillon)' : 'Voir la facture'}
    </a>
  );
}
