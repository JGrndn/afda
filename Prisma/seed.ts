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
    { startYear: 2023, endYear: 2024, status: 'inactive', membershipAmount: 10, totalDonations: 0 },
    { startYear: 2024, endYear: 2025, status: 'inactive', membershipAmount: 20, discountPercent: 5, totalDonations: 0 },
    { startYear: 2025, endYear: 2026, status: 'active', membershipAmount: 50, discountPercent:10, totalDonations: 0 },
  ];
  const seasons = await prisma.season.createManyAndReturn({data : seasonsData });
  console.log('✅ Seasons created');

  const workshopsData : Prisma.WorkshopCreateInput[] = [
    { name: 'Théâtre', description:'Silence on joue !', status: 'active', allowMultiple: false },
    { name: 'Musique', description:'Ca souffle, ça gratte, et ça fait du bruit', status: 'active', allowMultiple: false },
    { name: 'Cuisine', description:'Ca mijote, tant qu\'on ne fait pas un rougail avec de la Morteau', status: 'active', allowMultiple: false },
    { name: 'Photographie', description:'"Je vais prendre une photo mentale !"', status: 'active', allowMultiple: false },
    { name: 'Impro', description:'On parle beaucoup', status: 'active', allowMultiple: true, maxPerMember: 3 },
  ];
  const workshops = await prisma.workshop.createManyAndReturn({data: workshopsData});
  console.log('✅ Workshops created');

  const pricesData : Prisma.WorkshopPriceCreateManyInput[] = [
    // Season 2023-2024
    { workshopId: workshops[0].id, seasonId: seasons[0].id, amount: 110 }, // Théâtre
    { workshopId: workshops[1].id, seasonId: seasons[0].id, amount: 90 },  // Musique
    { workshopId: workshops[2].id, seasonId: seasons[0].id, amount: 140 }, // Cuisine
    { workshopId: workshops[3].id, seasonId: seasons[0].id, amount: 80 },  // Photographie
    { workshopId: workshops[4].id, seasonId: seasons[0].id, amount: 70 },  // Impro
    
    // Season 2024-2025
    { workshopId: workshops[0].id, seasonId: seasons[1].id, amount: 120 }, // Théâtre
    { workshopId: workshops[1].id, seasonId: seasons[1].id, amount: 100 }, // Musique
    { workshopId: workshops[2].id, seasonId: seasons[1].id, amount: 150 }, // Cuisine
    { workshopId: workshops[3].id, seasonId: seasons[1].id, amount: 85 },  // Photographie
    { workshopId: workshops[4].id, seasonId: seasons[1].id, amount: 75 },  // Impro
        
    // Season 2025-2026 (active)
    { workshopId: workshops[0].id, seasonId: seasons[2].id, amount: 130 }, // Théâtre
    { workshopId: workshops[1].id, seasonId: seasons[2].id, amount: 110 }, // Musique
    { workshopId: workshops[2].id, seasonId: seasons[2].id, amount: 160 }, // Cuisine
  ];
  const workshopPrices = await prisma.workshopPrice.createManyAndReturn({ data: pricesData });
  console.log('✅ Workshop Prices created');

  const familyData : Prisma.FamilyCreateManyInput[] = [
    { name: 'Dupont', address: '', phone : '', email : 'famille.dupont@mail.com' },
    { name: 'Martin', address: '', phone : '', email : 'famille.martin@mail.com' },
    { name: 'Etch', address: '', phone : '', email : 'famille.etch@mail.com' },
  ];
  const families = await prisma.family.createManyAndReturn({ data: familyData });
  console.log('✅ Families created');

  const memberData : Prisma.MemberCreateManyInput[] = [
    // famille Dupont
    { familyId: families[0].id, lastName: 'Dupont', firstName: 'Jean', isMinor: true, email: '', phone: '', guardianLastName: 'Dupont', guardianFirstName: 'Sabine', guardianPhone: '', guardianEmail: '' },
    { familyId: families[0].id, lastName: 'Dupont', firstName: 'Louis', isMinor: true, email: '', phone: '', guardianLastName: 'Dupont', guardianFirstName: 'Sabine', guardianPhone: '', guardianEmail: '' },
    { familyId: families[0].id, lastName: 'Dupont', firstName: 'Sabine', isMinor: false, email: '', phone: '', guardianLastName: '', guardianFirstName: '', guardianPhone: '', guardianEmail: '' },
    // Famille Martin
    { familyId: families[1].id, lastName: 'Martin', firstName: 'Pierre', isMinor: false, email: '', phone: '', guardianLastName: '', guardianFirstName: '', guardianPhone: '', guardianEmail: '' },
    { familyId: families[1].id, lastName: 'Pêcheur', firstName: 'Julie', isMinor: false, email: '', phone: '', guardianLastName: '', guardianFirstName: '', guardianPhone: '', guardianEmail: '' },
    { familyId: families[1].id, lastName: 'Martin-Pêcheur', firstName: 'Clément', isMinor: true, email: '', phone: '', guardianLastName: 'Martin', guardianFirstName: 'Pierre', guardianPhone: '', guardianEmail: '' },
    // Famille Etch
    { familyId: families[2].id, lastName: 'Etch', firstName: 'Fifi', isMinor: true, email: '', phone: '', guardianLastName: '', guardianFirstName: '', guardianPhone: '', guardianEmail: '' },
  ];
  const members = await prisma.member.createManyAndReturn({data: memberData});
  console.log('✅ Members created');
  
  const membershipData : Prisma.MembershipCreateManyInput[] = [
    // 2023/2024
    { memberId: members[0].id, seasonId: seasons[0].id, amount: seasons[0].membershipAmount, familyOrder:1 },
    { memberId: members[1].id, seasonId: seasons[0].id, amount: seasons[0].membershipAmount, familyOrder:2 },
    { memberId: members[3].id, seasonId: seasons[0].id, amount: seasons[0].membershipAmount, familyOrder:1 },
    { memberId: members[5].id, seasonId: seasons[0].id, amount: seasons[0].membershipAmount, familyOrder:2 },
    // 2024/2025
    { memberId: members[0].id, seasonId: seasons[1].id, amount: seasons[1].membershipAmount, familyOrder:1 },
    { memberId: members[2].id, seasonId: seasons[1].id, amount: seasons[1].membershipAmount, familyOrder:2 },
    { memberId: members[3].id, seasonId: seasons[1].id, amount: seasons[1].membershipAmount, familyOrder:1 },
    // 2025/2026
    { memberId: members[0].id, seasonId: seasons[2].id, amount: seasons[2].membershipAmount, familyOrder:1 },
    { memberId: members[1].id, seasonId: seasons[2].id, amount: seasons[2].membershipAmount, familyOrder:2 },
    { memberId: members[3].id, seasonId: seasons[2].id, amount: seasons[2].membershipAmount, familyOrder:1 },
    { memberId: members[4].id, seasonId: seasons[2].id, amount: seasons[2].membershipAmount, familyOrder:2 },
    { memberId: members[6].id, seasonId: seasons[2].id, amount: seasons[2].membershipAmount, familyOrder:1 },
  ];
  const memberships = await prisma.membership.createManyAndReturn({ data: membershipData });
  console.log('✅ Memberships created');

  const registrationsData : Prisma.RegistrationCreateManyInput[] = [
    // 2023/2024
    //    membre de la famille Dupont (memberid : 0 | 1)
    { memberId: members[0].id, seasonId: seasons[0].id, workshopId: workshops[0].id, appliedPrice: 110, discountPercent: seasons[0].discountPercent, quantity: 1 },
    { memberId: members[0].id, seasonId: seasons[0].id, workshopId: workshops[1].id, appliedPrice: 90, discountPercent: seasons[0].discountPercent, quantity: 1 },
    { memberId: members[1].id, seasonId: seasons[0].id, workshopId: workshops[0].id, appliedPrice: 99, discountPercent: seasons[0].discountPercent, quantity: 1 },
    //    membre de la famille Martin (memberid : 3 | 5)
    { memberId: members[3].id, seasonId: seasons[0].id, workshopId: workshops[0].id, appliedPrice: 110, discountPercent: seasons[0].discountPercent, quantity: 1 },
    { memberId: members[5].id, seasonId: seasons[0].id, workshopId: workshops[3].id, appliedPrice: 72, discountPercent: seasons[0].discountPercent, quantity: 1 },
    // 2024/2025
    //    membre de la famille Dupont (memberid : 0 | 2)
    { memberId: members[0].id, seasonId: seasons[1].id, workshopId: workshops[0].id, appliedPrice: 110, discountPercent: seasons[1].discountPercent, quantity: 1 },
    { memberId: members[2].id, seasonId: seasons[1].id, workshopId: workshops[0].id, appliedPrice: 104.5, discountPercent: seasons[1].discountPercent, quantity: 1 },
    //    membre de la famille Martin (memberid : 3 )
    { memberId: members[3].id, seasonId: seasons[1].id, workshopId: workshops[0].id, appliedPrice: 110, discountPercent: seasons[1].discountPercent, quantity: 1 },
    // 2025/2026
    //    membre de la famille Dupont (memberid : 0 | 1)
    { memberId: members[0].id, seasonId: seasons[2].id, workshopId: workshops[0].id, appliedPrice: 110, discountPercent: seasons[2].discountPercent, quantity: 1 },
    { memberId: members[1].id, seasonId: seasons[2].id, workshopId: workshops[0].id, appliedPrice: 99, discountPercent: seasons[2].discountPercent, quantity: 1 },
    //    membre de la famille Martin (memberid : 3 | 4)
    { memberId: members[3].id, seasonId: seasons[2].id, workshopId: workshops[0].id, appliedPrice: 130, discountPercent: seasons[2].discountPercent, quantity: 1 },
    { memberId: members[3].id, seasonId: seasons[2].id, workshopId: workshops[1].id, appliedPrice: 117, discountPercent: seasons[2].discountPercent, quantity: 1 },
    { memberId: members[4].id, seasonId: seasons[2].id, workshopId: workshops[0].id, appliedPrice: 130, discountPercent: seasons[2].discountPercent, quantity: 1 },
    //    membre de la famille Etc (memberid : 6 )
    { memberId: members[6].id, seasonId: seasons[2].id, workshopId: workshops[0].id, appliedPrice: 130, discountPercent: seasons[2].discountPercent, quantity: 1 },
    { memberId: members[6].id, seasonId: seasons[2].id, workshopId: workshops[2].id, appliedPrice: 160, discountPercent: seasons[2].discountPercent, quantity: 1 },
  ];
  const registrations = await prisma.registration.createManyAndReturn({ data: registrationsData });
  console.log('✅ Workshop registrations created');
}


async function clearDatabase(){
  await prisma.$transaction([
    prisma.membership.deleteMany(),
    prisma.registration.deleteMany(),
    prisma.season.deleteMany(),
    prisma.workshop.deleteMany(),
    prisma.workshopPrice.deleteMany(),
    prisma.family.deleteMany(),
    prisma.member.deleteMany()
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