'use client'

import { useState } from "react";
import { createWorkshopPrice, deleteWorkshopPrice, updateWorkshopPrice } from "@/app/workshops/workshops.actions";
import { WorkshopPriceDTO } from "@/lib/dto/workshopPrice.dto";
import { CreateWorkshopPriceInput, UpdateWorkshopPriceInput } from "@/lib/schemas/workshop.input";

export function useWorkshopPriceActions() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    create: (data: CreateWorkshopPriceInput) =>
      run<WorkshopPriceDTO>(() => createWorkshopPrice(data)),
    update: (id: number, data: UpdateWorkshopPriceInput) =>
      run<WorkshopPriceDTO>(() => updateWorkshopPrice(id, data)),
    remove: (id: number) => run<void>(() => deleteWorkshopPrice(id)),
    isLoading,
    error,
  };
}