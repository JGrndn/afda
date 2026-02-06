import { InvoiceDTO, InvoiceItemDTO } from "../dto/invoice.dto";
import { mapDraftInvoiceItemToDTO, mapInvoiceItemToDTO, mapInvoiceToDTO } from "@/lib/mappers/invoice.mapper";
import { memberService, membershipService, registrationService, workshopPriceService, workshopService } from "@/lib/services";

export async function buildInvoiceForFamily(
  familyId: number,
  seasonId: number,
): Promise<InvoiceDTO> {
  // get list of members
  const members = await memberService.getAll({familyId: familyId});
  const memberIds = members.map(m => m.id);
  // for each members, get membership
  const memberships = await membershipService.getAll({memberIds:memberIds, seasonId:seasonId});
  const invoiceMemberships : InvoiceItemDTO[] = [];
  for (const m of memberships){
    const person = members.find(p => p.id === m.memberId);
    if (person){
      const itemDTO =  mapDraftInvoiceItemToDTO({
        label: `Adhésion - ${person.firstName} ${person.lastName}`,
        unitPrice: m.amount,
        quantity: 1,
        lineTotal: m.amount
      });
      invoiceMemberships.push(itemDTO);
    }
  }
  // and get list of registrations also
  const registrations = await registrationService.getAll({memberIds:memberIds, seasonId:seasonId});
  const workshops = await workshopService.getAll();
  const invoiceRegistrations: InvoiceItemDTO[] = [];
  for (const r of registrations){
    const person = members.find(p => p.id === r.memberId);
    if (person){
      const ws = await workshops.find(w => w.id === r.workshopId);
      const itemDTO = mapDraftInvoiceItemToDTO({
        label: ws ? `${person.firstName} ${person.lastName} - ${ws.name}` : '',
        unitPrice: 0,
        quantity: r.quantity,
        lineTotal: r.totalPrice
      });
      invoiceRegistrations.push(itemDTO);
    }
  }

  const items = invoiceMemberships.concat(invoiceRegistrations)
  const totalAmount = items.reduce((sum, i) => sum+i.lineTotal, 0);

  return {
    familyId,
    seasonId,
    status: 'draft',
    totalAmount: totalAmount,
    items: items,
  };

}