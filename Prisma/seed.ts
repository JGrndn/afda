import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(){
  console.log('🌱 Starting seed...');

    // ==================== CLEAN DATABASE ====================
  console.log('🧹 Cleaning database...');
  
  console.log('✅ Database cleaned');
}


main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });