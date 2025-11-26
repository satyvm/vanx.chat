import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
  Get,
  Param,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { UIMessage } from 'ai';
import type { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface ChatRequestBody {
  messages: UIMessage[];
  model?: string;
  chatId?: string;
  id?: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get()
  async listChats(@Req() req: AuthenticatedRequest) {
    const userId = this.requireUser(req);
    return this.chatService.listChats(userId);
  }

  @Get(':id')
  async getChat(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = this.requireUser(req);
    if (!id) {
      throw new BadRequestException('Invalid chat id');
    }

    return this.chatService.getChatById(id, userId);
  }

  @Post('start')
  async startChat(
    @Body()
    body: { title?: string; messages?: UIMessage[] },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = this.requireUser(req);
    const chat = await this.chatService.createChatDraft({
      userId,
      title: body.title,
      messages: body.messages,
    });

    return { id: chat.id };
  }

  @Post()
  async chat(
    @Body() body: ChatRequestBody,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const userId = this.requireUser(req);

    try {
      this.logger.log(
        `Chat request: model=${body.model ?? 'default'}, chatId=${body.chatId ?? body.id ?? 'new'}, messages=${body.messages?.length ?? 0}`,
      );
      const result = await this.chatService.generateResponse(body.messages, {
        modelId: body.model,
        chatId: body.chatId ?? body.id,
        userId,
      });
      this.logger.log('Streaming response started');
      result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
      const errorMessage = (error as Error)?.message ?? 'unknown error';
      this.logger.error(
        `Failed to generate chat response: ${errorMessage}`,
        (error as Error)?.stack,
      );
      if (!res.headersSent) {
        // Check if it's a model version error
        const isModelVersionError =
          errorMessage.includes('Unsupported model version') ||
          errorMessage.includes('specification version');
        const statusCode = isModelVersionError ? 400 : 500;
        const message = isModelVersionError
          ? 'The selected model is not compatible with this version of the AI SDK. Please select a different model.'
          : 'Internal server error';

        res.status(statusCode).json({
          statusCode,
          message,
          error: errorMessage,
        });
      } else {
        // If headers are already sent, we can't send JSON, so end the response
        res.end();
      }
    }
  }

  private requireUser(req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return userId;
  }
}
