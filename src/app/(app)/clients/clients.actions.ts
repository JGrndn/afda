'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { ClientDTO } from '@/lib/dto/client.dto';
import {
  CreateClientInput,
  CreateClientSchema,
  UpdateClientInput,
  UpdateClientSchema,
} from '@/lib/schemas/client.input';
import { clientService } from '@/lib/services/client.service';

export async function createClient(input: CreateClientInput): Promise<ClientDTO> {
  return withAudit(async () => {
    const data = CreateClientSchema.parse(input);
    return clientService.create(data);
  });
}

export async function updateClient(id: number, input: UpdateClientInput): Promise<ClientDTO> {
  return withAudit(async () => {
    const data = UpdateClientSchema.parse(input);
    return clientService.update(id, data);
  });
}

export async function deleteClient(id: number): Promise<void> {
  return withAudit(async () => {
    return clientService.delete(id);
  });
}