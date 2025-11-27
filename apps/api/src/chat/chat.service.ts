import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  convertToCoreMessages,
  streamText,
  type CoreMessage,
  type UIMessage,
} from 'ai';
import { LLMFactory } from './llm-providers/factory';
import { MemoryXService } from './memory-x.service';
import { PrismaService } from 'src/prisma/prisma.service';

type ChatMessage = UIMessage & {
  content?: string;
  model?: string;
  metadata?: { model?: string; [key: string]: unknown };
};

interface GenerateResponseOptions {
  modelId?: string;
  chatId?: string;
  userId: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly memoryX: MemoryXService,
    private readonly prisma: PrismaService,
  ) {}

  async listChats(userId: string) {
    return this.prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getChatById(chatId: string, userId: string) {
    let chat;
    try {
      chat = await this.prisma.chat.findFirst({
        // Casting id to `any` keeps compatibility while we finish migrating IDs to UUIDs.
        where: { id: this.coerceChatId(chatId), userId },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to load chat ${chatId} for user ${userId}: ${
          (error as Error)?.message ?? 'unknown'
        }`,
      );
      throw new NotFoundException(`Chat ${chatId} not found`);
    }

    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} not found`);
    }

    return {
      ...chat,
      messages: this.parseMessages(chat.body),
    };
  }

  async createChatDraft({
    userId,
    title,
    messages = [],
  }: {
    userId: string;
    title?: string;
    messages?: ChatMessage[];
  }) {
    const computedTitle = title?.trim() || this.buildTitle(messages);
    const body = messages.length ? JSON.stringify(messages) : '[]';

    const chat = await this.prisma.chat.create({
      data: {
        title: computedTitle,
        description: this.buildDescriptionFromText(
          this.getMessageText(messages.at(-1)),
        ),
        body,
        userId,
      },
    });

    return chat;
  }

  async generateResponse(
    messages: UIMessage[],
    options: GenerateResponseOptions,
  ) {
    const { modelId, chatId, userId } = options;
    const requestMessages: ChatMessage[] = messages.map((message) => ({
      ...message,
      metadata:
        typeof message.metadata === 'object' && message.metadata !== null
          ? (message.metadata as Record<string, unknown>)
          : undefined,
    }));

    try {
      // 1. Get Context from MemoryX
      const context = await this.memoryX.getContext(requestMessages);

      // 2. Select Provider/Model
      this.logger.log(`Getting model: ${modelId ?? 'default'}`);
      let model = this.llmFactory.getModel(undefined, modelId);
      let resolvedModelId = this.resolveModelId(modelId);
      const specVersion = (model as any)?.specificationVersion;

      if (specVersion && specVersion !== 'v2') {
        this.logger.warn(
          `Model ${modelId ?? 'default'} uses unsupported specification version ${specVersion}; falling back to default v2 model.`,
        );
        model = this.llmFactory.getModel('google', 'gemini-2.5-flash');
        resolvedModelId = 'gemini-2.5-flash';
      }

      this.logger.log(`Model retrieved successfully`);

      const coreMessages: CoreMessage[] = convertToCoreMessages(
        requestMessages.map(
          ({ id, ...message }): Omit<UIMessage, 'id'> => message,
        ),
      );

      // 3. Stream Text
      this.logger.log(
        `Starting streamText with ${coreMessages.length} messages`,
      );
      try {
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
                model: resolvedModelId,
                metadata: { model: resolvedModelId },
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
                modelId: resolvedModelId,
                messages: fullConversation,
              });
              await this.memoryX.saveInteraction(
                fullConversation,
                assistantText,
              );
            } catch (error) {
              this.logger.error('Failed to persist chat data', error as Error);
            }
          },
        });

        this.logger.log('streamText initialized successfully');
        return result;
      } catch (streamError) {
        this.logger.error(
          `Failed to initialize streamText: ${(streamError as Error)?.message ?? 'unknown error'}`,
          (streamError as Error)?.stack,
        );
        throw streamError;
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate response with model ${modelId}: ${(error as Error)?.message ?? 'unknown error'}`,
        error as Error,
      );
      throw error;
    }
  }

  private async persistChat({
    userId,
    chatId,
    assistantText,
    modelId,
    messages,
  }: {
    userId: string;
    chatId?: string;
    assistantText: string;
    modelId?: string;
    messages: ChatMessage[];
  }) {
    void modelId;
    const payload = {
      title: this.buildTitle(messages),
      description: this.buildDescriptionFromText(assistantText),
      body: JSON.stringify(messages),
      userId,
    };

    if (chatId) {
      try {
        await this.prisma.chat.update({
          where: { id: this.coerceChatId(chatId), userId },
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

  private resolveModelId(modelId?: string) {
    if (!modelId) return 'gemini-2.5-flash';
    if (modelId === 'gemini') return 'gemini-2.5-flash';
    if (modelId === 'openai') return 'gpt-4o';
    if (modelId === 'groq') return 'llama-3.3-70b-versatile';
    if (modelId === 'xai' || modelId === 'grok') return 'grok-4-1';
    return modelId;
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

  private buildDescriptionFromText(text?: string | null) {
    if (!text) {
      return undefined;
    }
    const trimmed = text.trim();
    return trimmed ? trimmed.slice(0, 255) : undefined;
  }

  private parseMessages(body: string) {
    try {
      const parsed = JSON.parse(body);
      return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
    } catch (error) {
      this.logger.warn(
        `Failed to parse chat body: ${(error as Error)?.message ?? 'unknown'}`,
      );
      return [];
    }
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

  private coerceChatId(chatId: string) {
    // Handles both legacy numeric IDs and new UUIDs during migration.
    const numericId = Number(chatId);
    if (!Number.isNaN(numericId)) {
      return numericId as any;
    }
    return chatId as any;
  }
}
