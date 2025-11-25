import { Injectable, Logger } from '@nestjs/common';
import {
  convertToCoreMessages,
  streamText,
  type CoreMessage,
  type UIMessage,
} from 'ai';
import { LLMFactory } from './llm-providers/factory';
import { MemoryXService } from './memory-x.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface GenerateResponseOptions {
  modelId?: string;
  chatId?: number;
  userId: string;
}

type ChatMessage = UIMessage & { content?: string };

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly memoryX: MemoryXService,
    private readonly prisma: PrismaService,
  ) {}

  async generateResponse(
    messages: UIMessage[],
    options: GenerateResponseOptions,
  ) {
    const { modelId, chatId, userId } = options;
    const requestMessages = messages.map((message) => ({ ...message }));

    // 1. Get Context from MemoryX
    const context = await this.memoryX.getContext(requestMessages);

    // 2. Select Provider/Model
    // Default to Google for now as per plan
    const provider = 'google';
    const model = this.llmFactory.getModel(provider, modelId);

    const coreMessages: CoreMessage[] = convertToCoreMessages(
      requestMessages.map(
        ({ id, ...message }): Omit<UIMessage, 'id'> => message,
      ),
    );

    // 3. Stream Text
    const result = streamText({
      model,
      messages: coreMessages,
      system: context ? `Context: ${context}` : undefined,
      onFinish: async ({ usage, text }) => {
        // 4. Token Tracking
        const tokenUsage = usage as any;
        this.logger.log(
          `Token Usage: Input=${tokenUsage.promptTokens}, Output=${tokenUsage.completionTokens}, Total=${tokenUsage.totalTokens}`,
        );

        try {
          const assistantText = text ?? '';
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: assistantText,
            parts: [
              {
                type: 'text',
                text: assistantText,
              },
            ],
          };
          const fullConversation: ChatMessage[] = [
            ...requestMessages,
            assistantMessage,
          ];
          await this.persistChat({
            userId,
            chatId,
            assistantText,
            messages: fullConversation,
          });
          await this.memoryX.saveInteraction(fullConversation, assistantText);
        } catch (error) {
          this.logger.error('Failed to persist chat data', error as Error);
        }
      },
    });

    return result;
  }

  private async persistChat({
    userId,
    chatId,
    assistantText,
    messages,
  }: {
    userId: string;
    chatId?: number;
    assistantText: string;
    messages: ChatMessage[];
  }) {
    const payload = {
      title: this.buildTitle(messages),
      description: assistantText ? assistantText.slice(0, 255) : undefined,
      body: JSON.stringify(messages),
      userId,
    };

    if (chatId) {
      try {
        await this.prisma.chat.update({
          where: { id: chatId, userId },
          data: payload,
        });
        return chatId;
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Unable to update chat ${chatId} for user ${userId}. Creating a new record instead. Reason: ${reason}`,
        );
      }
    }

    const chat = await this.prisma.chat.create({
      data: payload,
    });
    return chat.id;
  }

  private buildTitle(messages: ChatMessage[]) {
    const firstUserMessage = messages.find(
      (message) => message.role === 'user',
    );
    const fallbackTitle = 'New Chat';
    if (!firstUserMessage) {
      return fallbackTitle;
    }

    const text = this.getMessageText(firstUserMessage);
    if (!text) {
      return fallbackTitle;
    }

    return text.length > 80 ? `${text.slice(0, 77)}...` : text;
  }

  private getMessageText(message: ChatMessage | undefined): string {
    if (!message) {
      return '';
    }

    if (typeof message.content === 'string') {
      return message.content;
    }

    const parts = Array.isArray(message.parts) ? message.parts : [];
    return parts
      .map((part: any) =>
        part?.type === 'text' && typeof part.text === 'string' ? part.text : '',
      )
      .filter(Boolean)
      .join('\n')
      .trim();
  }
}
