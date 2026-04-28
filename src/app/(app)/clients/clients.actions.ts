'use server';

import { withAudit } from '@/lib/audit/withAudit';
import { requireRoleAction } from '@/lib/auth/action-protection';
import { ClientDTO } from '@/lib/dto/client.dto';
import {
  CreateClientInput,
  CreateClientSchema,
  UpdateClientInput,
  UpdateClientSchema,
} from '@/lib/schemas/client.input';
import { clientService } from '@/lib/services/client.service';

export async function createClient(input: CreateClientInput): Promise<ClientDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = CreateClientSchema.parse(input);
    return clientService.create(data);
  });
}

export async function updateClient(id: number, input: UpdateClientInput): Promise<ClientDTO> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    const data = UpdateClientSchema.parse(input);
    return clientService.update(id, data);
  });
}

export async function deleteClient(id: number): Promise<void> {
  await requireRoleAction(['ADMIN', 'MANAGER']);
  return withAudit(async () => {
    return clientService.delete(id);
  });
}