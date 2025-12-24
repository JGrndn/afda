import 'dotenv/config';
import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(){
  console.log('🌱 Starting seed...');

  await clearDatabase();
  console.log('✅ Database cleaned');
  
  const seasonsData : Prisma.SeasonCreateInput[] = [
    { startYear: 2023, endYear: 2024, isActive: false, membershipAmount: 10, totalDonations: 0 },
    { startYear: 2024, endYear: 2025, isActive: false, membershipAmount: 20, discountPercent: 5, totalDonations: 0 },
    { startYear: 2025, endYear: 2026, isActive: true, membershipAmount: 50, discountPercent:10, totalDonations: 0 },
  ];
  const seasons = await prisma.season.createManyAndReturn({data : seasonsData });
  console.log('✅ Seasons created');
}

async function clearDatabase(){
  await prisma.$transaction([
    prisma.season.deleteMany(),
  ]);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });