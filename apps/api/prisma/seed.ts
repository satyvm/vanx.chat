// prisma/seed.ts
import { PrismaClient } from '../generated/prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample chats
    const chat1 = await prisma.chat.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Getting Started with Chat',
        messages: [
          'Hello! How can I help you today?',
          "I'm here to assist with any questions you might have.",
          'Feel free to ask me anything!',
        ],
      },
    });

    const chat2 = await prisma.chat.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Technical Discussion',
        messages: [
          "Let's talk about the latest technologies.",
          'What programming languages are you interested in?',
          'I can help with web development, databases, and more!',
        ],
      },
    });

    // Add more sample data as needed
    const chat3 = await prisma.chat.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'AI Assistant Chat',
        messages: [
          'Welcome to the AI assistant!',
          'I can help you with various tasks.',
          'What would you like to know?',
        ],
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
