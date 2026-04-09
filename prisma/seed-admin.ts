import 'dotenv/config';
import { PrismaClient, UserRole } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type UserProps = {
  email: string;
  name: string;
  pwd: string;
  role: UserRole
}

async function main() {
  console.log('🌱 Creating users...');
  /*const users: UserProps[] = [{
    email :'admin@afda.com',
    name : 'Administrateur', 
    pwd : 'admin123',
    role: 'ADMIN' 
  }, {
    email :'manager@afda.com',
    name : 'Manager', 
    pwd : 'manager123',
    role: 'MANAGER' 
  }, {
    email :'viewer@afda.com',
    name : 'Viewer', 
    pwd : 'viewer123',
    role: 'VIEWER' 
  }];*/
  const users: UserProps[] = [{
    email: 'emeline@grondin.com',
    name: 'Emeline',
    pwd: 'Du*8uAr5993Lagef@GqrLWIB',
    role: 'ADMIN'
  },{
    email: 'jerome@grondin.com',
    name: 'Jerome',
    pwd: '5x%qhVEcI$3Ggg#yaJk5iB&p',
    role: 'ADMIN'
  }] 

  for(const u of users){
    await createUser(u);
    console.log(`✅ User <${u.name}> created`);
  }
}

async function createUser({email, name, pwd, role}: UserProps){
  const existingAdmin = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingAdmin) {
    console.log(`✅ User <${email}> already exists`);
    return;
  }

  // Créer l'admin
  const hashedPassword = await bcrypt.hash(pwd, 10);

  const admin = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: name,
      role: role,
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });