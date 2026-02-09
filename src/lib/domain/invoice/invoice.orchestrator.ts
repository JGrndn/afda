import { InvoiceDTO } from '@/lib/dto/invoice.dto';
import { invoiceService } from '@/lib/services/invoice.service';
import { buildInvoiceForFamily } from './buildInvoiceForFamily';

export async function getInvoiceForFamilyAndSeason(
  familyId: number,
  seasonId: number
): Promise<InvoiceDTO> {
  const existing = await invoiceService.findByFamilyAndSeason(familyId, seasonId);

  if (existing) {
    return existing;
  }

  // Draft projeté (non persisté)
  return buildInvoiceForFamily(familyId, seasonId);
}