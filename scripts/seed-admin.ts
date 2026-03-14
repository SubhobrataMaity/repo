import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.adminUser.findFirst();

  if (adminExists) {
    console.log('Admin user already exists. Trimming and replacing...');
    await prisma.adminUser.deleteMany();
  }

  const password = "Password";
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  await prisma.adminUser.create({
    data: {
      password_hash: passwordHash,
    },
  });

  console.log('Admin seeded with password: Password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
