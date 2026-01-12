'use client'

import { createWorkshopPrice, deleteWorkshopPrice, updateWorkshopPrice } from "@/app/workshops/workshops.actions";
import { createCrudActionsHook } from "@/lib/actions/useServerActions";
import { WorkshopPriceDTO } from "@/lib/dto/workshopPrice.dto";
import { CreateWorkshopPriceInput, UpdateWorkshopPriceInput } from "@/lib/schemas/workshop.input";

export const useWorkshopPriceActions = createCrudActionsHook<
  CreateWorkshopPriceInput,
  UpdateWorkshopPriceInput,
  WorkshopPriceDTO
>({
  create: createWorkshopPrice,
  update: updateWorkshopPrice,
  remove: deleteWorkshopPrice,
});