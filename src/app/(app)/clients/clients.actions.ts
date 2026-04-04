'use server';

import { ClientDTO } from '@/lib/dto/client.dto';
import {
  CreateClientInput,
  CreateClientSchema,
  UpdateClientInput,
  UpdateClientSchema,
} from '@/lib/schemas/client.input';
import { clientService } from '@/lib/services/client.service';

export async function createClient(input: CreateClientInput): Promise<ClientDTO> {
  const data = CreateClientSchema.parse(input);
  return clientService.create(data);
}

export async function updateClient(id: number, input: UpdateClientInput): Promise<ClientDTO> {
  const data = UpdateClientSchema.parse(input);
  return clientService.update(id, data);
}

export async function deleteClient(id: number): Promise<void> {
  return clientService.delete(id);
}