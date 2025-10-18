// prisma/seed.ts

import { PrismaClient } from '../generated/prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create two dummy chats
  const chat1 = await prisma.chat.upsert({
    where: { title: 'Getting Started with Chat' },
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
    where: { title: 'Technical Discussion' },
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

  console.log({ chat1, chat2 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
