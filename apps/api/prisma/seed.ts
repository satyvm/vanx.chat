import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting seed...');

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
        name: 'Admin User',
        password: await hashPassword('admin123'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: await hashPassword('password123'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: await hashPassword('password123'),
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.wilson@example.com' },
      update: {},
      create: {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        password: await hashPassword('password123'),
      },
    }),
  ]);

  console.log('Seed completed successfully!');
  console.log(`Created ${users.length} users`);
}

void main()
  .catch((e: unknown) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
