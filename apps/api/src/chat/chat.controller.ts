import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { UIMessage } from 'ai';
import type { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface ChatRequestBody {
  messages: UIMessage[];
  model?: string;
  chatId?: number;
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
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body() body: ChatRequestBody,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const result = await this.chatService.generateResponse(body.messages, {
      modelId: body.model,
      chatId: body.chatId,
      userId,
    });
    result.pipeUIMessageStreamToResponse(res);
  }
}
