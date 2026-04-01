import { InvoiceDTO } from '@/lib/dto/invoice.dto';
import { invoiceService } from '@/lib/services/invoice.service';
import { familyService, seasonService } from '@/lib/services';
import { buildInvoiceForFamily } from './buildInvoiceForFamily';

export async function getInvoiceForFamilyAndSeason(
  familyId: number,
  seasonId: number
): Promise<InvoiceDTO> {
  const existing = await invoiceService.findByFamilyAndSeason(familyId, seasonId);

  if (existing) {
    // The mapper sets season to '' — populate it here where we can fetch
    if (!existing.season) {
      const season = await seasonService.getById(seasonId);
      existing.season = season
        ? `${season.startYear}/${season.endYear}`
        : '';
    }
    // same for family name and address
    const family = await familyService.getById(familyId);
    if (!existing.familyAddress && family?.address){
      existing.familyAddress = family.address
    }
    if (!existing.familyName && family?.name)
    {
      existing.familyName = 'M. ou Mme ' + family.name;
    }
    return existing;
  }

  // Draft projeté (non persisté) — buildInvoiceForFamily already sets season
  return buildInvoiceForFamily(familyId, seasonId);
}