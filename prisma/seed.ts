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
    { startYear: 2023, endYear: 2024, status: 'inactive', membershipAmount: 10 },
    { startYear: 2024, endYear: 2025, status: 'inactive', membershipAmount: 20, discountPercent: 5 },
    { startYear: 2025, endYear: 2026, status: 'active', membershipAmount: 50, discountPercent: 10 },
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
    { workshopId: workshops[0].id, seasonId: seasons[0].id, amount: 110 },
    { workshopId: workshops[1].id, seasonId: seasons[0].id, amount: 90 },
    { workshopId: workshops[2].id, seasonId: seasons[0].id, amount: 140 },
    { workshopId: workshops[3].id, seasonId: seasons[0].id, amount: 80 },
    { workshopId: workshops[4].id, seasonId: seasons[0].id, amount: 70 },
    // Season 2024-2025
    { workshopId: workshops[0].id, seasonId: seasons[1].id, amount: 120 },
    { workshopId: workshops[1].id, seasonId: seasons[1].id, amount: 100 },
    { workshopId: workshops[2].id, seasonId: seasons[1].id, amount: 150 },
    { workshopId: workshops[3].id, seasonId: seasons[1].id, amount: 85 },
    { workshopId: workshops[4].id, seasonId: seasons[1].id, amount: 75 },
    // Season 2025-2026 (active)
    { workshopId: workshops[0].id, seasonId: seasons[2].id, amount: 130 },
    { workshopId: workshops[1].id, seasonId: seasons[2].id, amount: 110 },
    { workshopId: workshops[2].id, seasonId: seasons[2].id, amount: 160 },
    { workshopId: workshops[4].id, seasonId: seasons[2].id, amount: 140 },
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
    { familyId: families[2].id, lastName: 'Etch', firstName: 'Fifi', isMinor: false, email: '', phone: '', guardianLastName: '', guardianFirstName: '', guardianPhone: '', guardianEmail: '' },
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
    { memberId: members[0].id, seasonId: seasons[0].id, workshopId: workshops[0].id, totalPrice: 110, discountPercent: 0, quantity: 1 },
    { memberId: members[0].id, seasonId: seasons[0].id, workshopId: workshops[1].id, totalPrice: 90, discountPercent: 0, quantity: 1 },
    { memberId: members[1].id, seasonId: seasons[0].id, workshopId: workshops[0].id, totalPrice: 99, discountPercent: seasons[0].discountPercent, quantity: 1 },
    { memberId: members[3].id, seasonId: seasons[0].id, workshopId: workshops[0].id, totalPrice: 110, discountPercent: 0, quantity: 1 },
    { memberId: members[5].id, seasonId: seasons[0].id, workshopId: workshops[3].id, totalPrice: 72, discountPercent: seasons[0].discountPercent, quantity: 1 },
    // 2024/2025
    { memberId: members[0].id, seasonId: seasons[1].id, workshopId: workshops[0].id, totalPrice: 110, discountPercent: 0, quantity: 1 },
    { memberId: members[2].id, seasonId: seasons[1].id, workshopId: workshops[0].id, totalPrice: 104.5, discountPercent: seasons[1].discountPercent, quantity: 1 },
    { memberId: members[3].id, seasonId: seasons[1].id, workshopId: workshops[0].id, totalPrice: 110, discountPercent: 0, quantity: 1 },
    // 2025/2026
    { memberId: members[0].id, seasonId: seasons[2].id, workshopId: workshops[0].id, totalPrice: 110, discountPercent: 0, quantity: 1 },
    { memberId: members[1].id, seasonId: seasons[2].id, workshopId: workshops[0].id, totalPrice: 99, discountPercent: seasons[2].discountPercent, quantity: 1 },
    { memberId: members[3].id, seasonId: seasons[2].id, workshopId: workshops[0].id, totalPrice: 130, discountPercent: 0, quantity: 1 },
    { memberId: members[3].id, seasonId: seasons[2].id, workshopId: workshops[1].id, totalPrice: 117, discountPercent: 0, quantity: 1 },
    { memberId: members[4].id, seasonId: seasons[2].id, workshopId: workshops[0].id, totalPrice: 130, discountPercent: seasons[2].discountPercent, quantity: 1 },
    { memberId: members[6].id, seasonId: seasons[2].id, workshopId: workshops[0].id, totalPrice: 130, discountPercent: 0, quantity: 1 },
    { memberId: members[6].id, seasonId: seasons[2].id, workshopId: workshops[2].id, totalPrice: 160, discountPercent: 0, quantity: 1 },
  ];
  const registrations = await prisma.registration.createManyAndReturn({ data: registrationsData });
  console.log('✅ Workshop registrations created');

  const paymentData: Prisma.PaymentCreateManyInput[] = [
    {
      familyId: families[2].id,
      seasonId: seasons[2].id,
      amount: '120',
      donationAmount: '20',
      paymentType: 'cash',
      paymentDate: new Date(2025, 8, 15).toISOString(),
      status:'completed'
    }
  ];
  const payments = await prisma.payment.createManyAndReturn({data: paymentData });
  console.log('✅ Payments created');

  console.log('🌱 Seeding clients, quotes & invoices...');

  const activeSeason = await prisma.season.findFirst({
    where: { status: 'active' },
  });

  if (!activeSeason) {
    throw new Error('❌ Aucune saison active trouvée.');
  }

  console.log(`✅ Saison active trouvée : ${activeSeason.startYear}-${activeSeason.endYear}`);

  const clientsData: Prisma.ClientCreateManyInput[] = [
    {
      name: 'Commune de Presles-en-Brie',
      address: '1 place de la Mairie, 77220 Presles-en-Brie',
      phone: '01 64 38 00 00',
      email: 'mairie@presles-en-brie.fr',
      contact: 'Mme Dupuis - Service culturel',
    },
    {
      name: 'Commune de Fontenay-Trésigny',
      address: '2 rue de la Liberté, 77610 Fontenay-Trésigny',
      phone: '01 64 25 91 00',
      email: 'culture@fontenay-tresigny.fr',
      contact: 'M. Bernard',
    },
    {
      name: 'Association Les Jeunes Pouces',
      address: '14 allée des Acacias, 77000 Melun',
      phone: '06 12 34 56 78',
      email: 'contact@jeunespouces.org',
      contact: 'Mme Leclerc',
    },
    {
      name: 'École primaire Jules Ferry',
      address: '8 rue Jules Ferry, 77220 Tournan-en-Brie',
      phone: '01 64 42 00 10',
      email: 'ce.0771234a@ac-creteil.fr',
      contact: 'M. Martin - Directeur',
    },
  ];

  const clients = await prisma.client.createManyAndReturn({ data: clientsData });
  console.log(`✅ ${clients.length} clients créés`);

  const [commune1, commune2, asso, ecole] = clients;

  const quote1 = await prisma.quote.create({
    data: {
      clientId: commune1.id,
      title: 'Animation théâtre — Fête de la commune',
      description: 'Spectacle de théâtre d\'improvisation pour la fête annuelle de la commune, en plein air.',
      status: 'invoiced',
      quoteNumber: 'D202509-1001',
      issuedAt: new Date('2025-09-01'),
      validUntil: new Date('2025-10-01'),
      totalAmount: new Prisma.Decimal(850),
      notes: 'Prévoir sono et scène. Durée : 1h30.',
      items: {
        create: [
          { label: 'Prestation artistique (3 comédiens)', description: 'Spectacle d\'improvisation — 1h30', unitPrice: new Prisma.Decimal(250), quantity: 3, lineTotal: new Prisma.Decimal(750) },
          { label: 'Frais de déplacement', unitPrice: new Prisma.Decimal(100), quantity: 1, lineTotal: new Prisma.Decimal(100) },
        ],
      },
    },
  });

  await prisma.quoteInvoice.create({
    data: {
      quoteId: quote1.id,
      seasonId: activeSeason.id,
      invoiceNumber: 'F202509-1001',
      status: 'paid',
      issuedAt: new Date('2025-09-15'),
      paidAt: new Date('2025-10-03'),
      paymentMethod: 'transfer',
      totalAmount: new Prisma.Decimal(850),
    },
  });

  console.log('✅ Devis 1 créé (invoiced + paid)');

  const quote2 = await prisma.quote.create({
    data: {
      clientId: commune2.id,
      title: 'Atelier théâtre enfants — Mercredi culturel',
      description: 'Trois ateliers d\'initiation au théâtre pour enfants de 7 à 12 ans, les mercredis après-midi.',
      status: 'invoiced',
      quoteNumber: 'D202510-1002',
      issuedAt: new Date('2025-10-01'),
      validUntil: new Date('2025-11-01'),
      totalAmount: new Prisma.Decimal(540),
      items: {
        create: [
          { label: 'Atelier d\'initiation théâtre (2h)', description: 'Animé par 1 comédien, groupe de 15 enfants max', unitPrice: new Prisma.Decimal(180), quantity: 3, lineTotal: new Prisma.Decimal(540) },
        ],
      },
    },
  });

  await prisma.quoteInvoice.create({
    data: {
      quoteId: quote2.id,
      seasonId: activeSeason.id,
      invoiceNumber: 'F202510-1002',
      status: 'issued',
      issuedAt: new Date('2025-10-20'),
      totalAmount: new Prisma.Decimal(540),
    },
  });

  console.log('✅ Devis 2 créé (invoiced + issued)');

  await prisma.quote.create({
    data: {
      clientId: asso.id,
      title: 'Stage intensif improvisation — Vacances de Noël',
      status: 'accepted',
      quoteNumber: 'D202511-1003',
      issuedAt: new Date('2025-11-05'),
      validUntil: new Date('2025-12-05'),
      totalAmount: new Prisma.Decimal(1200),
      notes: 'Salle fournie par l\'association. Matériel pédagogique inclus.',
      items: {
        create: [
          { label: 'Journée de stage (2 animateurs)', description: '9h-17h, pause déjeuner non incluse', unitPrice: new Prisma.Decimal(400), quantity: 3, lineTotal: new Prisma.Decimal(1200) },
        ],
      },
    },
  });

  console.log('✅ Devis 3 créé (accepted)');

  await prisma.quote.create({
    data: {
      clientId: ecole.id,
      title: 'Intervention théâtre en classe — Cycle CM1/CM2',
      status: 'sent',
      quoteNumber: 'D202511-1004',
      issuedAt: new Date('2025-11-10'),
      validUntil: new Date('2025-12-10'),
      totalAmount: new Prisma.Decimal(480),
      notes: 'Dates à convenir avec l\'enseignant référent.',
      items: {
        create: [
          { label: 'Intervention théâtrale en classe (1h)', unitPrice: new Prisma.Decimal(120), quantity: 4, lineTotal: new Prisma.Decimal(480) },
        ],
      },
    },
  });

  console.log('✅ Devis 4 créé (sent)');

  await prisma.quote.create({
    data: {
      clientId: commune1.id,
      title: 'Spectacle de fin d\'année — Décembre 2025',
      status: 'draft',
      quoteNumber: 'D202511-1005',
      issuedAt: new Date('2025-11-20'),
      validUntil: new Date('2025-12-20'),
      totalAmount: new Prisma.Decimal(1050),
      items: {
        create: [
          { label: 'Prestation artistique (3 comédiens)', unitPrice: new Prisma.Decimal(300), quantity: 3, lineTotal: new Prisma.Decimal(900) },
          { label: 'Création costumes et accessoires', unitPrice: new Prisma.Decimal(150), quantity: 1, lineTotal: new Prisma.Decimal(150) },
        ],
      },
    },
  });

  console.log('✅ Devis 5 créé (draft)');

  await prisma.quote.create({
    data: {
      clientId: commune2.id,
      title: 'Résidence artistique — Été 2025',
      status: 'rejected',
      quoteNumber: 'D202506-1006',
      issuedAt: new Date('2025-06-01'),
      validUntil: new Date('2025-07-01'),
      totalAmount: new Prisma.Decimal(3200),
      notes: 'Budget refusé par le conseil municipal.',
      items: {
        create: [
          { label: 'Résidence artistique (5 jours, 4 comédiens)', unitPrice: new Prisma.Decimal(640), quantity: 5, lineTotal: new Prisma.Decimal(3200) },
        ],
      },
    },
  });

  console.log('✅ Devis 6 créé (rejected)');

  console.log('\n📊 Résumé du seed :');
  console.log(`   • Saisons         : ${seasons.length}`);
  console.log(`   • Ateliers        : ${workshops.length}`);
  console.log(`   • Familles        : ${families.length}`);
  console.log(`   • Membres         : ${members.length}`);
  console.log(`   • Clients         : ${clients.length}`);
  console.log(`   • Devis           : 6`);
  console.log(`   • Factures        : 2 (1 payée, 1 en attente)`);
}

async function clearDatabase(){
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.membership.deleteMany(),
    prisma.registration.deleteMany(),
    prisma.season.deleteMany(),
    prisma.workshop.deleteMany(),
    prisma.workshopPrice.deleteMany(),
    prisma.family.deleteMany(),
    prisma.member.deleteMany(),
    prisma.quoteInvoice.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.client.deleteMany(),
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