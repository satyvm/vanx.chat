import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password helper
  const hashPassword = (password: string): Promise<string> => {
    return bcrypt.hash(password, 10); // eslint-disable-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  };

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: await hashPassword('admin123'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName:'Doe',
        password: await hashPassword('password123'),
      },
    });

    const chat2 = await prisma.chat.upsert({
      where: { id: 2 },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName:'Smith',
        password: await hashPassword('password123'),
      },
    });

    // Add more sample data as needed
    const chat3 = await prisma.chat.upsert({
      where: { id: 3 },
      update: {},
      create: {
        email: 'bob.wilson@example.com',
        firstName: 'Bob',
        lastName:'Wilson',
        password: await hashPassword('password123'),
      },
    });

    console.log('✅ Successfully seeded database with:');
    console.log(`   - ${chat1.title} (ID: ${chat1.id})`);
    console.log(`   - ${chat2.title} (ID: ${chat2.id})`);
    console.log(`   - ${chat3.title} (ID: ${chat3.id})`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Execute the main function
main()
  .catch((e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Seeding completed successfully!');
  });
