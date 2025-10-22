import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Seeds the database with initial data
 */
async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  try {
    // Hash password helper with proper error handling
    const hashPassword = async (password: string): Promise<string> => {
      try {
        return await bcrypt.hash(password, 12); // Increased salt rounds for better security
      } catch (error) {
        console.error('❌ Error hashing password:', error);
        throw new Error('Failed to hash password');
      }
    };

    // Define seed data
    const seedUsers = [
      {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123',
        role: 'admin',
      },
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        role: 'user',
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        role: 'user',
      },
    ];

    // Create users with proper error handling
    console.log('👥 Creating users...');
    const createdUsers: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      password: string;
      refreshToken: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    for (const userData of seedUsers) {
      try {
        const hashedPassword = await hashPassword(userData.password);

        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {
            // Only update if password is different (for re-seeding)
            password: hashedPassword,
            updatedAt: new Date(),
          },
          create: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: hashedPassword,
          },
        });

        createdUsers.push(user);
        console.log(`✅ User created/updated: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error);
        throw error;
      }
    }

    console.log(`🎉 Successfully seeded ${createdUsers.length} users`);

    // Add any additional seed data here
    // Example: Create sample chats, categories, etc.
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  }
}

/**
 * Main execution function with proper cleanup
 */
async function main(): Promise<void> {
  try {
    await seedDatabase();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  } finally {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
  }
}

// Execute the main function
main();
