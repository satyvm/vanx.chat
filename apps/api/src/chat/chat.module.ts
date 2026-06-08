import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LLMFactory } from './llm-providers/factory';
import { MemoryXService } from './memory-x.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [ChatService, LLMFactory, MemoryXService, JwtAuthGuard],
})
export class ChatModule {}
