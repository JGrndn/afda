'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { WorkshopDTO } from '@/lib/dto/workshop.dto';
import { WorkshopPriceDTO } from '@/lib/dto/workshopPrice.dto';
import {
CreateWorkshopInput,
CreateWorkshopSchema,
UpdateWorkshopInput,
UpdateWorkshopSchema,
CreateWorkshopPriceInput,
CreateWorkshopPriceSchema,
UpdateWorkshopPriceInput,
UpdateWorkshopPriceSchema,
} from '@/lib/schemas/workshop.input';
import { workshopService } from '@/lib/services/workshop.service';
import { workshopPriceService } from '@/lib/services/workshopPrice.service';

// Workshop Actions
export async function createWorkshop(input: CreateWorkshopInput): Promise<WorkshopDTO> {
  return withAudit(async () => {
    const data = CreateWorkshopSchema.parse(input);
    const result = await workshopService.create(data);
    return result;
  });
}

export async function updateWorkshop(
  id: number,
  input: UpdateWorkshopInput
): Promise<WorkshopDTO> {
  return withAudit(async () => {
    const data = UpdateWorkshopSchema.parse(input);
    const result = await workshopService.update(id, data);
    return result;
  });
}

export async function deleteWorkshop(id: number): Promise<void> {
  return withAudit(async () => {
    await workshopService.delete(id);
  });
}

// WorkshopPrice Actions
export async function createWorkshopPrice(
  input: CreateWorkshopPriceInput
): Promise<WorkshopPriceDTO> {
  return withAudit(async () => {
    const data = CreateWorkshopPriceSchema.parse(input);
    const result = await workshopPriceService.create(data);
    return result;
  });
}

export async function updateWorkshopPrice(
  id: number,
  input: UpdateWorkshopPriceInput
): Promise<WorkshopPriceDTO> {
  return withAudit(async () => {
    const data = UpdateWorkshopPriceSchema.parse(input);
    const result = await workshopPriceService.update(id, data);
    return result;
  });
}

export async function deleteWorkshopPrice(id: number): Promise<void> {
  return withAudit(async () => {
    await workshopPriceService.delete(id);
  });
}