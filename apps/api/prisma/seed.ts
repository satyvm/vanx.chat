import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.chat.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'sam@example.com',
      firstName: 'Sam',
      lastName: 'Developer',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Engineer',
      password: hashedPassword,
    },
  });

  console.log('✓ Created users:', { user1, user2 });

  // Create chats
  const chat1 = await prisma.chat.create({
    data: {
      title: 'Getting Started with Prisma',
      description: 'Learn the basics of Prisma ORM',
      body: 'Prisma is a next-generation ORM that provides a clean and type-safe API for working with databases...',
    },
  });

  const chat2 = await prisma.chat.create({
    data: {
      title: 'DevOps Best Practices',
      description: 'CI/CD pipelines and deployment strategies',
      body: 'Implementing robust CI/CD pipelines is crucial for modern software development...',
    },
  });

  const chat3 = await prisma.chat.create({
    data: {
      title: 'Crypto Analysis',
      description: 'Understanding market trends',
      body: 'Technical analysis involves studying price action and volume patterns...',
    },
  });

  console.log('✓ Created chats:', { chat1, chat2, chat3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
