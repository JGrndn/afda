import { InvoiceDTO, InvoiceItemByMemberDTO, InvoiceItemDTO } from '@/lib/dto/invoice.dto';
import {
  familyService,
  memberService,
  membershipService,
  registrationService,
  seasonService,
  workshopPriceService,
} from '@/lib/services';

export async function buildInvoiceForFamily(
  familyId: number,
  seasonId: number
): Promise<InvoiceDTO> {
  const season = await seasonService.getById(seasonId);

  const members = await memberService.getAll({ familyId });
  const memberIds = members.map((m) => m.id);
  const family = await familyService.getById(familyId);

  const workshopPrices = await workshopPriceService.getAllForSeason(seasonId);
  const memberships = await membershipService.getAll({ memberIds, seasonId });
  const registrations = await registrationService.getAll({ memberIds, seasonId });
  
  const itemsByMember:InvoiceItemByMemberDTO[] = [];
  for (const m of memberships){
    const currentMember = members.find(o => o.id === m.memberId);
    if (currentMember){
      const data:InvoiceItemByMemberDTO = {
        memberId: currentMember.id,
        memberName: `${currentMember.firstName} ${currentMember.lastName}`,
        items: [{
          label: 'Adhésion',
          unitPrice: m.amount,
          quantity: 1,
          lineTotal: m.amount
        }]
      }
      const currentRegistrations = registrations.filter(r => r.memberId === currentMember.id);
      if (currentRegistrations){
        for (const r of currentRegistrations){
          const ws = workshopPrices.find(wp => wp.workshopId === r.workshopId);
          if (ws){
            data.items.push({
              label: ws.workshop.name,
              unitPrice: ws.amount,
              discountPercent: r.discountPercent,
              quantity: r.quantity,
              lineTotal: r.totalPrice
            });
          }
        }
      }
      itemsByMember.push(data);
    }
  }

  const totalAmount = itemsByMember
    .flatMap(m => m.items)
    .reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: null,
    familyId,
    seasonId,
    season: `${season?.startYear}/${season?.endYear}`,
    status: 'draft',
    invoiceNumber: null,
    issuedAt: null,
    itemsByMember,
    familyName: family?.name ? `M. ou Mme ${family.name}` : '',
    familyAddress: family?.address ?? null,
    totalAmount,
  };
}