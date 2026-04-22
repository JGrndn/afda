
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { auditExtension } from '@/lib/audit/auditExtension';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof buildPrismaClient> | undefined;
};

function buildPrismaClient(){
  const adapter = new PrismaPg({ connectionString : process.env.DATABASE_URL });
  const base = new PrismaClient({ adapter:adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']});
  
  return base.$extends(auditExtension);
}

export const prisma = globalForPrisma.prisma ?? buildPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}