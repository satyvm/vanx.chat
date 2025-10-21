import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.chat.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: hashedPassword,
    },
  });

  // Create chats
  await prisma.chat.create({
    data: {
      title: 'First Chat',
      description: 'My first chat message',
      body: 'Hello, this is the first chat!',
      userId: user1.id,
    },
  });

  await prisma.chat.create({
    data: {
      title: 'AI Discussion',
      description: 'Discussing AI and ML',
      body: "Let's talk about artificial intelligence and machine learning.",
      userId: user1.id,
    },
  });

  await prisma.chat.create({
    data: {
      title: 'DevOps Chat',
      body: 'Setting up CI/CD pipelines and monitoring.',
      userId: user2.id,
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
