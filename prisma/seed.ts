import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create users from the login page static data
  const users = [
    { username: 'admin', password: 'admin123', role: 'ADMIN', fullName: 'Administrator', email: 'admin@stockmgmt.com' },
    { username: 'consultant1', password: 'consult1', role: 'CONSULTANT', fullName: 'Consultant One', email: 'consultant1@stockmgmt.com' },
    { username: 'consultant2', password: 'consult2', role: 'CONSULTANT', fullName: 'Consultant Two', email: 'consultant2@stockmgmt.com' },
    { username: 'consultant3', password: 'consult3', role: 'CONSULTANT', fullName: 'Consultant Three', email: 'consultant3@stockmgmt.com' },
    { username: 'consultant4', password: 'consult4', role: 'CONSULTANT', fullName: 'Consultant Four', email: 'consultant4@stockmgmt.com' },
  ];

  // Create admin user first
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: 'admin123', // Update password if user exists
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      role: 'ADMIN',
      fullName: 'Administrator',
      email: 'admin@stockmgmt.com',
      isActive: true,
    },
  });

  console.log(`✅ Created admin user: ${adminUser.username}`);

  // Create consultant users
  for (const userData of users.slice(1)) { // Skip admin user
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        password: userData.password, // In production, this should be hashed
        role: userData.role as 'CONSULTANT',
        fullName: userData.fullName,
        email: userData.email,
        isActive: true,
        createdBy: adminUser.id, // Set admin as creator
      },
    });

    console.log(`✅ Created user: ${user.username}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
